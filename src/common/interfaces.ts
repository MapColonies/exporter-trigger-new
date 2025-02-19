import { IRasterCatalogUpsertRequestBody } from '@map-colonies/mc-model-types';
import { ICreateJobBody, IJobResponse, OperationStatus } from '@map-colonies/mc-priority-queue';
import {
  CallbackUrlsTargetArray,
  ExportJobParameters,
  LinksDefinition,
  RasterProductTypes,
  RoiFeatureCollection,
  TileFormatStrategy,
  TileOutputFormat,
} from '@map-colonies/raster-shared';
import { BBox, Geometry } from 'geojson';

export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface OpenApiConfig {
  filePath: string;
  basePath: string;
  jsonPath: string;
  uiPath: string;
}

export interface ICreateExportJobResponse {
  jobId: string;
  taskIds: string[];
  status: OperationStatus.PENDING | OperationStatus.COMPLETED | OperationStatus.IN_PROGRESS;
  isDuplicated?: boolean;
}

export interface IStorageStatusResponse {
  free: number;
  size: number;
}

export interface IJobStatusResponse {
  percentage: number | undefined;
  status: OperationStatus;
}

export type GetJobResponse = IJobResponse<unknown, unknown>;

export type LayerInfo = Required<IRasterCatalogUpsertRequestBody>;

export interface IGeometryRecordBase {
  zoomLevel: number;
  sanitizedBox?: BBox | null | undefined;
}

export interface IGeometryRecord extends IGeometryRecordBase {
  geometry?: Geometry;
  targetResolutionDeg: number;
  targetResolutionMeter: number;
  minResolutionDeg: number;
  minZoomLevel: number;
}

export interface JobExportDuplicationParams {
  resourceId: string;
  version: string;
  dbId: string;
  crs: string;
  roi: RoiFeatureCollection;
}

export interface ITaskParameters {
  blockDuplication?: boolean;
}

export interface IExportInitRequest {
  crs: string;
  roi: RoiFeatureCollection;
  callbacks?: CallbackUrlsTargetArray;
  fileNamesTemplates: LinksDefinition;
  relativeDirectoryPath: string;
  dbId: string;
  priority?: number;
  version: string;
  cswProductId: string;
  productType: RasterProductTypes;
  packageRelativePath: string;
  gpkgEstimatedSize: number;
  targetFormat: TileOutputFormat;
  outputFormatStrategy: TileFormatStrategy;
  description?: string;
}

export type CreateExportJobBody = ICreateJobBody<ExportJobParameters, ITaskParameters>;

export interface IStorageEstimation {
  jpegTileEstimatedSizeInBytes: number;
  pngTileEstimatedSizeInBytes: number;
  storageFactorBuffer: number;
}
