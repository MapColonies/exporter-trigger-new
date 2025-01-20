/* eslint-disable @typescript-eslint/no-magic-numbers */
import { IFindJobsRequest, OperationStatus } from '@map-colonies/mc-priority-queue';
import { getUTCDate } from '@map-colonies/mc-utils';
import { TileFormatStrategy, TileOutputFormat } from '@map-colonies/raster-shared';
import { dupParams } from '../data';

export const completedExportParams = {
  resourceId: dupParams.resourceId,
  version: dupParams.version,
  isCleaned: false,
  type: 'Export',
  shouldReturnTasks: false,
  status: 'Completed',
} as IFindJobsRequest;

export const completedExportJobsResponse = [
  {
    id: '8eddc842-64ee-4e90-b3a5-b10d9e86acb2',
    resourceId: 'SOME_NAME',
    version: '1.0',
    type: 'Export',
    description: 'This is roi exporting example',
    parameters: {
      cleanupDataParams: {
        directoryPath: '63baedae-cb5b-4c0a-a7db-8eb6b9105cb7',
        cleanupExpirationTimeUTC: '2028-02-01T12:28:50.000Z',
      },
      callbackParams: {
        roi: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [34.85671849225366, 32.306563240778644],
                    [34.858090125180894, 32.30241218787266],
                    [34.862337900781455, 32.30263664191864],
                    [34.86154145051941, 32.30708703329364],
                    [34.85671849225366, 32.306563240778644],
                  ],
                ],
              },
              properties: {
                maxResolutionDeg: 0.703125,
              },
            },
          ],
        },
        jobId: '8eddc842-64ee-4e90-b3a5-b10d9e86acb2',
        links: {
          dataURI:
            'https://download-dev.mapcolonies.net/api/raster/v1/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.gpkg',
          metadataURI:
            'https://download-dev.mapcolonies.net/api/raster/v1/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.json',
        },
        status: 'Completed',
        fileSize: 77824,
        artifacts: [
          {
            url: 'https://download-dev.mapcolonies.net/api/raster/v1/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.gpkg',
            name: 'Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.gpkg',
            size: 77824,
            type: 'GPKG',
          },
          {
            url: 'https://download-dev.mapcolonies.net/api/raster/v1/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.json',
            name: 'Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.json',
            size: 1312,
            type: 'METADATA',
          },
        ],
        description: 'This is roi exporting example',
        expirationTime: '2025-02-01T12:28:50.000Z',
        recordCatalogId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
      },
      additionalParams: {
        fileNamesTemplates: {
          dataURI: 'Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_00_02_621Z.gpkg',
          metadataURI: 'Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_00_02_621Z.json',
        },
        packageRelativePath: '63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_00_02_621Z.gpkg',
        relativeDirectoryPath: '63baedae-cb5b-4c0a-a7db-8eb6b9105cb7',
        outputFormatStrategy: TileFormatStrategy.MIXED,
        targetFormat: TileOutputFormat.PNG,
        gpkgEstimatedSize: 11111,
      },
      exportInputParams: {
        crs: 'EPSG:4326',
        roi: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [34.85671849225366, 32.306563240778644],
                    [34.858090125180894, 32.30241218787266],
                    [34.862337900781455, 32.30263664191864],
                    [34.86154145051941, 32.30708703329364],
                    [34.85671849225366, 32.306563240778644],
                  ],
                ],
              },
              properties: {
                maxResolutionDeg: 0.703125,
              },
            },
          ],
        },
        callbackUrls: [
          {
            url: 'http://example.getmap.com/callback',
          },
          {
            url: 'http://example.getmap.com/callback2',
          },
        ],
      },
    },
    status: 'Completed',
    percentage: 100,
    reason: '',
    domain: 'RASTER',
    isCleaned: false,
    priority: 0,
    expirationDate: null,
    internalId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
    producerName: null,
    productName: 'SOME_NAME',
    productType: 'Orthophoto',
    additionalIdentifiers: '63baedae-cb5b-4c0a-a7db-8eb6b9105cb7',
    taskCount: 2,
    completedTasks: 2,
    failedTasks: 0,
    expiredTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    abortedTasks: 0,
    created: '2025-01-02T12:22:56.284Z',
    updated: '2025-01-02T12:28:50.505Z',
  },
];

export const updateCompletedExpirationParams = {
  parameters: {
    ...completedExportJobsResponse[0].parameters,
    cleanupDataParams: {
      ...completedExportJobsResponse[0].parameters.cleanupDataParams,
      cleanupExpirationTimeUTC: new Date(getUTCDate().getDate() + 30),
      directoryPath: completedExportJobsResponse[0].parameters.cleanupDataParams.directoryPath,
    },
  },
};

export const completedJobCallback = {
  ...completedExportJobsResponse[0].parameters.callbackParams,
  status: OperationStatus.COMPLETED,
};
