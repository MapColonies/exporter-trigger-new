import { Logger } from '@map-colonies/js-logger';
import { Tracer, trace } from '@opentelemetry/api';
import { withSpanAsyncV4, withSpanV4 } from '@map-colonies/telemetry';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { inject, injectable } from 'tsyringe';
import { featureCollectionBooleanEqual } from '@map-colonies/mc-utils';
import { type IJobResponse, OperationStatus } from '@map-colonies/mc-priority-queue';
import { BadRequestError } from '@map-colonies/error-types';
import { LayerMetadata } from '@map-colonies/mc-model-types';
import { callbackExportResponse, callbacksTargetArray, exportJobParameters, JobExportResponse } from '@map-colonies/raster-shared';
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
  public async validateLayer(requestedLayerId: string): Promise<LayerMetadata> {
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
    callbackUrls?: callbacksTargetArray
  ): Promise<callbackExportResponse | ICreateExportJobResponse | undefined> {
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
      throw new BadRequestError(
        `The requested minResolutionDeg ${record.minResolutionDeg} is larger then maxResolutionDeg ${record.targetResolutionDeg}`
      );
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
  private async checkForExportCompleted(dupParams: JobExportDuplicationParams): Promise<callbackExportResponse | undefined> {
    this.logger.info({ ...dupParams, roi: undefined, msg: `Checking for COMPLETED duplications with parameters` });
    const responseJob = await this.jobManagerClient.findExportJob(OperationStatus.COMPLETED, dupParams);
    if (responseJob) {
      await this.jobManagerClient.validateAndUpdateExpiration(responseJob.id);
      return {
        ...responseJob.parameters.callbackParams,
        status: OperationStatus.COMPLETED,
      } as callbackExportResponse;
    }
  }

  @withSpanAsyncV4
  private async checkForExportProcessing(
    dupParams: JobExportDuplicationParams,
    newCallbacks?: callbacksTargetArray
  ): Promise<ICreateExportJobResponse | undefined> {
    this.logger.info({ ...dupParams, roi: undefined, msg: `Checking for PROCESSING duplications with parameters` });
    const processingJob =
      (await this.jobManagerClient.findExportJob(OperationStatus.IN_PROGRESS, dupParams, true)) ??
      (await this.jobManagerClient.findExportJob(OperationStatus.PENDING, dupParams, true));
    if (processingJob) {
      await this.updateExportCallbackURLs(processingJob, newCallbacks);
      return {
        jobId: processingJob.id,
        taskIds: (processingJob.tasks as unknown as JobExportResponse[]).map((t) => t.id),
        status: OperationStatus.IN_PROGRESS,
      };
    }
  }

  @withSpanAsyncV4
  private async updateExportCallbackURLs(processingJob: JobExportResponse, newCallbacks?: callbacksTargetArray): Promise<void> {
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
    await this.jobManagerClient.updateJob<exportJobParameters>(processingJob.id, {
      parameters: processingJob.parameters,
    });
  }
}
