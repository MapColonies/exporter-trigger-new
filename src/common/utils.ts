import checkDiskSpace from 'check-disk-space';
import { FeatureCollection } from 'geojson';
import { bboxToTileRange, degreesPerPixelToZoomLevel, ITileRange, zoomLevelToResolutionMeter } from '@map-colonies/mc-utils';
import { TileOutputFormat } from '@map-colonies/raster-shared';
import config from 'config';
import { container } from 'tsyringe';
import { Logger } from '@map-colonies/js-logger';
import { IGeometryRecord, IStorageStatusResponse } from './interfaces';
import { SERVICES, ZOOM_ZERO_RESOLUTION } from './constants';

export const getStorageStatus = async (gpkgsLocation: string): Promise<IStorageStatusResponse> => {
  return checkDiskSpace(gpkgsLocation);
};

export const parseFeatureCollection = (featuresCollection: FeatureCollection): IGeometryRecord[] => {
  const parsedGeoRecord: IGeometryRecord[] = [];
  featuresCollection.features.forEach((feature) => {
    if (feature.properties && (feature.properties.maxResolutionDeg as number)) {
      const targetResolutionDeg = feature.properties.maxResolutionDeg as number;
      const zoomLevel = degreesPerPixelToZoomLevel(targetResolutionDeg);
      const targetResolutionMeter = zoomLevelToResolutionMeter(zoomLevel) as number;
      const minResolutionDeg =
        feature.properties.minResolutionDeg !== undefined ? (feature.properties.minResolutionDeg as number) : ZOOM_ZERO_RESOLUTION;
      const minZoomLevel = degreesPerPixelToZoomLevel(minResolutionDeg);
      parsedGeoRecord.push({
        geometry: feature.geometry,
        targetResolutionDeg,
        targetResolutionMeter,
        minResolutionDeg,
        minZoomLevel,
        zoomLevel,
      });
    }
  });
  return parsedGeoRecord;
};

export const calculateEstimateGpkgSize = (featuresRecords: IGeometryRecord[], tileOutputFormat: TileOutputFormat): number => {
  const tileEstimatedSize = getTileEstimatedSize(tileOutputFormat);
  const batches: ITileRange[] = [];
  featuresRecords.forEach((record) => {
    for (let zoom = record.minZoomLevel; zoom <= record.zoomLevel; zoom++) {
      const recordBatches = bboxToTileRange(record.sanitizedBox, zoom);
      batches.push(recordBatches);
    }
  });

  let totalTilesCount = 0;
  batches.forEach((batch) => {
    const width = batch.maxX - batch.minX;
    const height = batch.maxY - batch.minY;
    const area = width * height;
    totalTilesCount += area;
  });
  const gpkgEstimatedSize = totalTilesCount * tileEstimatedSize;
  return gpkgEstimatedSize;
};

export const getTileEstimatedSize = (tileOutputFormat: TileOutputFormat): number => {
  const jpegTileEstimatedSizeInBytes = config.get<number>('storageEstimation.jpegTileEstimatedSizeInBytes');
  const pngTileEstimatedSizeInBytes = config.get<number>('storageEstimation.pngTileEstimatedSizeInBytes');
  const logger = container.resolve<Logger>(SERVICES.LOGGER);
  let tileEstimatedSize;
  if (tileOutputFormat === TileOutputFormat.JPEG) {
    tileEstimatedSize = jpegTileEstimatedSizeInBytes;
  } else {
    tileEstimatedSize = pngTileEstimatedSizeInBytes;
  }
  logger.debug(`single tile size defined as ${tileOutputFormat} from configuration: ${tileEstimatedSize} bytes`);

  return tileEstimatedSize;
};
