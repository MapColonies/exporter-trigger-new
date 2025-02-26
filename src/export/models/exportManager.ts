import { sep } from 'node:path';
import { Logger } from '@map-colonies/js-logger';
import { Tracer } from '@opentelemetry/api';
import { inject, injectable } from 'tsyringe';
import { degreesPerPixelToZoomLevel } from '@map-colonies/mc-utils';
import { OperationStatus } from '@map-colonies/mc-priority-queue';
import { feature, featureCollection } from '@turf/helpers';
import { withSpanAsyncV4 } from '@map-colonies/telemetry';
import { IConfig, ICreateExportJobResponse, IExportInitRequest, IGeometryRecord, IJobStatusResponse } from '@src/common/interfaces';
import { MultiPolygon, Polygon } from 'geojson';
import { calculateEstimateGpkgSize, parseFeatureCollection } from '@src/common/utils';
import {
  LinksDefinition,
  TileFormatStrategy,
  SourceType,
  CallbackExportResponse,
  CallbackUrls,
  RoiProperties,
  RasterProductTypes,
  RoiFeatureCollection,
} from '@map-colonies/raster-shared';
import { v4 as uuidv4 } from 'uuid';
import { CreateExportRequest } from '@src/utils/zod/schemas';
import { LayerMetadata } from '@map-colonies/mc-model-types';
import { JobManagerWrapper } from '../../clients/jobManagerWrapper';
import { DEFAULT_CRS, DEFAULT_PRIORITY, SERVICES } from '../../common/constants';
import { ValidationManager } from './validationManager';

@injectable()
export class ExportManager {
  private readonly tilesProvider: SourceType;
  private readonly gpkgsLocation: string;

  public constructor(
    @inject(SERVICES.CONFIG) private readonly config: IConfig,
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.TRACER) public readonly tracer: Tracer,
    @inject(JobManagerWrapper) private readonly jobManagerClient: JobManagerWrapper,
    @inject(ValidationManager) private readonly validationManager: ValidationManager
  ) {
    this.tilesProvider = config.get<SourceType>('tilesProvider');
    this.gpkgsLocation = config.get<string>('gpkgsLocation');
    this.tilesProvider = this.tilesProvider.toUpperCase() as SourceType;
  }

  @withSpanAsyncV4
  public async createExport(userInput: CreateExportRequest): Promise<ICreateExportJobResponse | CallbackExportResponse> {
    const { dbId, crs, priority, callbackURLs, description } = userInput;
    const layerMetadata = await this.validationManager.findLayer(dbId);

    let roi = userInput.roi;

    if (!roi) {
      // convert and wrap layer's footprint to featureCollection
      roi = this.calculateRoi(layerMetadata);
    }

    const { productId: resourceId, productVersion: version, maxResolutionDeg: srcRes } = layerMetadata;
    const productType = layerMetadata.productType as RasterProductTypes;
    const callbacks = callbackURLs ? callbackURLs.map((url) => <CallbackUrls>{ url }) : undefined;
    const maxZoom = degreesPerPixelToZoomLevel(srcRes);

    // ROI vs layer validation section - zoom + geo intersection
    const featuresRecords = this.validationManager.validateFeaturesCollection(
      parseFeatureCollection(roi),
      layerMetadata.footprint as Polygon | MultiPolygon,
      maxZoom,
      srcRes
    );

    const duplicationExist = await this.findJobDuplications(resourceId, version, dbId, roi, crs ?? DEFAULT_CRS, callbacks);
    if (duplicationExist) {
      return duplicationExist;
    }

    const estimatesGpkgSize = calculateEstimateGpkgSize(featuresRecords, layerMetadata.tileOutputFormat);
    await this.validationManager.validateFreeSpace(estimatesGpkgSize, this.gpkgsLocation);

    //creation of params
    const prefixPackageName = this.generateExportFileNames(productType, resourceId, version, featuresRecords);
    const packageName = `${prefixPackageName}.gpkg`;
    const metadataFileName = `${prefixPackageName}.json`;
    const fileNamesTemplates: LinksDefinition = {
      dataURI: packageName,
      metadataURI: metadataFileName,
    };
    const additionalIdentifiers = uuidv4();
    const separator = this.getSeparator();
    const packageRelativePath = `${additionalIdentifiers}${separator}${packageName}`;

    const workerInput: IExportInitRequest = {
      crs: crs ?? DEFAULT_CRS,
      roi: roi,
      callbacks: callbacks,
      fileNamesTemplates: fileNamesTemplates,
      relativeDirectoryPath: additionalIdentifiers,
      packageRelativePath,
      dbId,
      version: version,
      cswProductId: resourceId,
      productType,
      priority: priority ?? DEFAULT_PRIORITY,
      description,
      targetFormat: layerMetadata.tileOutputFormat,
      outputFormatStrategy: TileFormatStrategy.MIXED,
      gpkgEstimatedSize: estimatesGpkgSize,
    };
    const jobCreated = await this.jobManagerClient.createExportJob(workerInput);
    return jobCreated;
  }

  @withSpanAsyncV4
  public async getJobStatusByJobId(jobId: string): Promise<IJobStatusResponse> {
    const job = await this.jobManagerClient.getJobByJobId(jobId);

    const statusResponse: IJobStatusResponse = {
      percentage: job.percentage,
      status: job.status,
    };
    this.logger.debug({ msg: `retrieved job: ${jobId},with percentage: ${job.percentage} and status: ${job.status}` });
    return statusResponse;
  }

  private getSeparator(): string {
    return this.tilesProvider === 'S3' ? '/' : sep;
  }

  private generateExportFileNames(productType: string, productId: string, productVersion: string, featuresRecords: IGeometryRecord[]): string {
    const maxZoom = Math.max(...featuresRecords.map((feature) => feature.zoomLevel));
    let currentDateStr = new Date().toJSON();
    currentDateStr = `${currentDateStr}`.replaceAll('-', '_').replaceAll('.', '_').replaceAll(':', '_');
    return `${productType}_${productId}_${productVersion.replaceAll('.', '_')}_${maxZoom}_${currentDateStr}`;
  }

  private async findJobDuplications(
    resourceId: string,
    version: string,
    catalogId: string,
    roi: RoiFeatureCollection,
    crs: string,
    callbacks?: CallbackUrls[]
  ): Promise<CallbackExportResponse | ICreateExportJobResponse | undefined> {
    const duplicationExist = await this.validationManager.checkForExportDuplicate(resourceId, version, catalogId, roi, crs, callbacks);

    if (duplicationExist && duplicationExist.status === OperationStatus.COMPLETED) {
      const callbackParam = duplicationExist as CallbackExportResponse;
      this.logger.info({
        jobStatus: callbackParam.status,
        jobId: callbackParam.jobId,
        catalogId: callbackParam.recordCatalogId,
        msg: `Found relevant cache for export request`,
      });
    } else if (duplicationExist) {
      const jobResponse = duplicationExist as ICreateExportJobResponse;
      this.logger.info({ jobId: jobResponse.jobId, status: jobResponse.status, msg: `Found exists relevant In-Progress job for export request` });
    }
    return duplicationExist;
  }

  private calculateRoi(layerMetadata: LayerMetadata): RoiFeatureCollection {
    // convert and wrap layer's footprint to featureCollection
    const layerMaxResolutionDeg = layerMetadata.maxResolutionDeg;
    const layerMinResolutionDeg = layerMetadata.minResolutionDeg;
    const layerFeature = feature<Polygon | MultiPolygon, RoiProperties>(layerMetadata.footprint as Polygon | MultiPolygon, {
      maxResolutionDeg: layerMaxResolutionDeg,
      minResolutionDeg: layerMinResolutionDeg,
    });
    const roi = featureCollection([layerFeature]);
    this.logger.info({
      catalogId: layerMetadata.id,
      productId: layerMetadata.productId,
      productVersion: layerMetadata.productVersion,
      productType: layerMetadata.productType,
      msg: `ROI not provided, will use default layer's geometry`,
    });
    return roi;
  }
}
