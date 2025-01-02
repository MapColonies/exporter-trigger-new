import checkDiskSpace from 'check-disk-space';
import { FeatureCollection, Geometry } from 'geojson';
import { degreesPerPixelToZoomLevel, zoomLevelToResolutionMeter } from '@map-colonies/mc-utils';
import md5 from 'md5';
import { ZOOM_ZERO_RESOLUTION } from './constants';
import { IGeometryRecord, IStorageStatusResponse } from './interfaces';

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

/**
 * generated unique hashed string value for FeatureCollection geography - notice! features order influence on hashing
 * @param geo FeatureCollection object
 * @returns md5 hashed string
 */
export const generateGeoIdentifier = (geo: FeatureCollection): string => {
  const stringifiedGeo = JSON.stringify(geo);
  const additionalIdentifiers = md5(stringifiedGeo);
  return additionalIdentifiers;
};
