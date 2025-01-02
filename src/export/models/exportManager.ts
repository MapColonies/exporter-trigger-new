import { sep } from 'node:path';
import { Logger } from '@map-colonies/js-logger';
import { Tracer } from '@opentelemetry/api';
import PolygonBbox from '@turf/bbox';
import { inject, injectable } from 'tsyringe';
import { degreesPerPixelToZoomLevel } from '@map-colonies/mc-utils';
import { OperationStatus } from '@map-colonies/mc-priority-queue';
import { ProductType } from '@map-colonies/mc-model-types';
import { feature, featureCollection } from '@turf/helpers';
import { withSpanAsyncV4 } from '@map-colonies/telemetry';
import { IConfig, ICreateExportJobResponse, ICreateExportRequest, IExportInitRequest, IGeometryRecord } from '@src/common/interfaces';
import { Geometry, MultiPolygon, Polygon } from 'geojson';
import { generateGeoIdentifier, parseFeatureCollection } from '@src/common/utils';
import { LinksDefinition, TileFormatStrategy, CallbackTarget, MergerSourceType, CallbackExportResponse } from '@map-colonies/raster-shared';
import { JobManagerWrapper } from '../../clients/jobManagerWrapper';
import { DEFAULT_CRS, DEFAULT_PRIORITY, SERVICES } from '../../common/constants';
import { ValidationManager } from './validationManager';

@injectable()
export class ExportManager {
  private readonly tilesProvider: MergerSourceType;
  private readonly gpkgsLocation: string;

  public constructor(
    @inject(SERVICES.CONFIG) private readonly config: IConfig,
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.TRACER) public readonly tracer: Tracer,
    @inject(JobManagerWrapper) private readonly jobManagerClient: JobManagerWrapper,
    @inject(ValidationManager) private readonly validationManager: ValidationManager
  ) {
    this.tilesProvider = config.get<MergerSourceType>('tilesProvider');
    this.gpkgsLocation = config.get<string>('gpkgsLocation');

    this.tilesProvider = this.tilesProvider.toUpperCase() as MergerSourceType;
  }

  @withSpanAsyncV4
  public async createExport(userInput: ICreateExportRequest): Promise<ICreateExportJobResponse | CallbackExportResponse> {
    const { dbId, crs, priority, callbackURLs, description } = userInput;
    const layerMetadata = await this.validationManager.validateLayer(dbId);

    let roi = userInput.roi;

    if (!roi) {
      // convert and wrap layer's footprint to featureCollection
      const layerMaxResolutionDeg = layerMetadata.maxResolutionDeg;
      const layerFeature = feature(layerMetadata.footprint as Geometry, { maxResolutionDeg: layerMaxResolutionDeg });
      roi = featureCollection([layerFeature]);
      this.logger.info({
        catalogId: dbId,
        productId: layerMetadata.productId,
        productVersion: layerMetadata.productVersion,
        productType: layerMetadata.productType,
        callbackURLs,
        msg: `ROI not provided, will use default layer's geometry`,
      });
    }

    let { productId: resourceId, productVersion: version, productType, maxResolutionDeg: srcRes } = layerMetadata;

    resourceId = resourceId as string;
    version = version as string;
    productType = productType as ProductType;
    srcRes = srcRes as number;
    const maxZoom = degreesPerPixelToZoomLevel(srcRes);

    // ROI vs layer validation section - zoom + geo intersection
    const featuresRecords = this.validationManager.validateFeaturesCollection(
      parseFeatureCollection(roi),
      layerMetadata.footprint as Polygon | MultiPolygon,
      maxZoom,
      srcRes
    );

    const callbacks = callbackURLs ? callbackURLs.map((url) => <CallbackTarget>{ url, roi }) : undefined;
    const duplicationExist = await this.validationManager.checkForExportDuplicate(resourceId, version, dbId, roi, crs ?? DEFAULT_CRS, callbacks);

    if (duplicationExist && duplicationExist.status === OperationStatus.COMPLETED) {
      const callbackParam = duplicationExist as CallbackExportResponse;
      this.logger.info({
        jobStatus: callbackParam.status,
        jobId: callbackParam.jobId,
        catalogId: callbackParam.recordCatalogId,
        msg: `Found relevant cache for export request`,
      });
      return duplicationExist;
    } else if (duplicationExist) {
      const jobResponse = duplicationExist as ICreateExportJobResponse;
      this.logger.info({ jobId: jobResponse.jobId, status: jobResponse.status, msg: `Found exists relevant In-Progress job for export request` });
      return duplicationExist;
    }

    //creation of params
    const prefixPackageName = this.generateExportFileNames(productType, resourceId, version, featuresRecords);
    const packageName = `${prefixPackageName}.gpkg`;
    const metadataFileName = `${prefixPackageName}.json`;
    const fileNamesTemplates: LinksDefinition = {
      dataURI: packageName,
      metadataURI: metadataFileName,
    };
    const additionalIdentifiers = generateGeoIdentifier(roi);
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
    };
    const jobCreated = await this.jobManagerClient.createExportJob(workerInput);
    return jobCreated;
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
}
