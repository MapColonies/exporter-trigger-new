import { Logger } from '@map-colonies/js-logger';
import { Tracer, trace } from '@opentelemetry/api';
import { withSpanAsyncV4, withSpanV4 } from '@map-colonies/telemetry';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { inject, injectable } from 'tsyringe';
import { featureCollectionBooleanEqual } from '@map-colonies/mc-utils';
import { type IJobResponse, OperationStatus } from '@map-colonies/mc-priority-queue';
import { BadRequestError } from '@map-colonies/error-types';
import { LayerMetadata } from '@map-colonies/mc-model-types';
import { CallbackExportResponse, CallbacksTargetArray, ExportJobParameters, JobExportResponse } from '@map-colonies/raster-shared';
import { SERVICES } from '../../common/constants';
import { JobManagerWrapper } from '../../clients/jobManagerWrapper';
import { RasterCatalogManagerClient } from '../../clients/rasterCatalogManagerClient';
import { IConfig, ICreateExportJobResponse, IGeometryRecord, JobExportDuplicationParams } from '../../common/interfaces';
import { sanitizeBbox } from '../../utils/geometry';

@injectable()
export class ValidationManager {
  public constructor(
    @inject(SERVICES.CONFIG) private readonly config: IConfig,
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.TRACER) public readonly tracer: Tracer,
    @inject(JobManagerWrapper) private readonly jobManagerClient: JobManagerWrapper,
    @inject(RasterCatalogManagerClient) private readonly rasterCatalogManager: RasterCatalogManagerClient
  ) {}

  @withSpanAsyncV4
  public async findLayer(requestedLayerId: string): Promise<LayerMetadata> {
    const layer = await this.rasterCatalogManager.findLayer(requestedLayerId);
    return layer.metadata;
  }

  @withSpanAsyncV4
  public async checkForExportDuplicate(
    resourceId: string,
    version: string,
    dbId: string,
    roi: FeatureCollection,
    crs: string,
    callbackUrls?: CallbacksTargetArray
  ): Promise<CallbackExportResponse | ICreateExportJobResponse | undefined> {
    const dupParams: JobExportDuplicationParams = {
      resourceId,
      version,
      dbId,
      roi,
      crs,
    };
    let completedExists = await this.checkForExportCompleted(dupParams);
    if (completedExists) {
      return completedExists;
    }

    const processingExists = await this.checkForExportProcessing(dupParams, callbackUrls);
    if (processingExists) {
      // For race condition
      completedExists = await this.checkForExportCompleted(dupParams);
      if (completedExists) {
        return completedExists;
      }
      return { ...processingExists, isDuplicated: true };
    }

    return undefined;
  }

  @withSpanV4
  public validateZoom(record: IGeometryRecord, maxZoom: number, sourceResolution: number): void {
    if (record.zoomLevel > maxZoom) {
      throw new BadRequestError(`The requested resolution ${record.targetResolutionDeg} is larger then product's resolution ${sourceResolution}`);
    }

    if (record.zoomLevel < record.minZoomLevel) {
      throw new BadRequestError(`The requested resolution ${record.zoomLevel} is smaller then minResolutionDeg ${record.minZoomLevel}`);
    }
  }

  @withSpanV4
  public validateFeaturesCollection(
    featuresRecords: IGeometryRecord[],
    footprint: Polygon | MultiPolygon,
    maxZoom: number,
    srcRes: number
  ): IGeometryRecord[] {
    // ROI vs layer validation section - zoom + geo intersection
    featuresRecords.forEach((record) => {
      this.validateZoom(record, maxZoom, srcRes);
      // generate sanitized bbox for each original feature
      record.sanitizedBox = sanitizeBbox({
        polygon: record.geometry as Polygon | MultiPolygon,
        footprint: footprint,
        zoom: record.zoomLevel,
      });
      if (!record.sanitizedBox) {
        throw new BadRequestError(`Requested ${JSON.stringify(record.geometry as Polygon | MultiPolygon)} has no intersection with requested layer`);
      }
    });
    return featuresRecords;
  }

  @withSpanAsyncV4
  private async checkForExportCompleted(dupParams: JobExportDuplicationParams): Promise<CallbackExportResponse | undefined> {
    this.logger.info({ ...dupParams, roi: undefined, msg: `Checking for COMPLETED duplications with parameters` });
    const responseJob = await this.jobManagerClient.findExportJob(OperationStatus.COMPLETED, dupParams);
    if (responseJob) {
      await this.jobManagerClient.validateAndUpdateExpiration(responseJob.id);
      return {
        ...responseJob.parameters.callbackParams,
        status: OperationStatus.COMPLETED,
      } as CallbackExportResponse;
    }
  }

  @withSpanAsyncV4
  private async checkForExportProcessing(
    dupParams: JobExportDuplicationParams,
    newCallbacks?: CallbacksTargetArray
  ): Promise<ICreateExportJobResponse | undefined> {
    this.logger.info({ ...dupParams, roi: undefined, msg: `Checking for PROCESSING duplications with parameters` });
    const processingJob =
      (await this.jobManagerClient.findExportJob(OperationStatus.IN_PROGRESS, dupParams, true)) ??
      (await this.jobManagerClient.findExportJob(OperationStatus.PENDING, dupParams, true));
    if (processingJob) {
      await this.updateExportCallbackURLs(processingJob, newCallbacks);
      console.log(processingJob.status === OperationStatus.PENDING);
      return {
        jobId: processingJob.id,
        taskIds: (processingJob.tasks as unknown as JobExportResponse[]).map((t) => t.id),
        status: processingJob.status === OperationStatus.PENDING ? OperationStatus.PENDING : OperationStatus.IN_PROGRESS,
      };
    }
  }

  @withSpanAsyncV4
  private async updateExportCallbackURLs(processingJob: JobExportResponse, newCallbacks?: CallbacksTargetArray): Promise<void> {
    if (!newCallbacks) {
      return;
    }

    if (!processingJob.parameters.exportInputParams.callbacks) {
      processingJob.parameters.exportInputParams.callbacks = newCallbacks;
    } else {
      const callbacks = processingJob.parameters.exportInputParams.callbacks;
      for (const newCallback of newCallbacks) {
        const hasCallback = callbacks.findIndex((callback) => {
          const exist = callback.url === newCallback.url;
          if (!exist) {
            return false;
          }
          const sameROI = featureCollectionBooleanEqual(callback.roi, newCallback.roi);
          return sameROI;
        });
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (hasCallback === -1) {
          callbacks.push(newCallback);
        }
      }
    }
    await this.jobManagerClient.updateJob<ExportJobParameters>(processingJob.id, {
      parameters: processingJob.parameters,
    });
  }
}
