/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ProductType, TileOutputFormat } from '@map-colonies/mc-model-types';
import { ICreateJobResponse, OperationStatus } from '@map-colonies/mc-priority-queue';
import { JobExportResponse, TileFormatStrategy } from '@map-colonies/raster-shared';
import { FeatureCollection } from 'geojson';
import { CreateExportJobBody, IExportInitRequest, IJobStatusResponse, JobExportDuplicationParams } from '../../../src/common/interfaces';
import { inProgressJobsResponse } from '../requestMocks/processingRequest';

export const getJobStatusByIdResponse: IJobStatusResponse = {
  percentage: inProgressJobsResponse[0].percentage,
  status: OperationStatus.IN_PROGRESS,
};

export const inProgressJobResponse: JobExportResponse = {
  id: '18842968-303b-4dd2-9aae-97cadcf71fa9',
  resourceId: 'SOME_NAME',
  version: '1.0',
  type: 'Export',
  description: 'This is roi exporting example',
  parameters: {
    additionalParams: {
      fileNamesTemplates: {
        dataURI: 'Orthophoto_SOME_NAME_1_0_0_2025_01_05T09_37_40_928Z.gpkg',
        metadataURI: 'Orthophoto_SOME_NAME_1_0_0_2025_01_05T09_37_40_928Z.json',
      },
      packageRelativePath: '65adbc306ad555ca82ca12df9153dee1/Orthophoto_SOME_NAME_1_0_0_2025_01_05T09_37_40_928Z.gpkg',
      relativeDirectoryPath: '65adbc306ad555ca82ca12df9153dee1',
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
                  [34.6435778262786, 31.815594485406223],
                  [34.6179124326446, 31.770015748101358],
                  [34.64962842353242, 31.75977953590275],
                  [34.67862188480788, 31.802845039349506],
                  [34.6435778262786, 31.815594485406223],
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
  status: OperationStatus.IN_PROGRESS,
  percentage: 0,
  reason: '',
  domain: 'RASTER',
  isCleaned: false,
  priority: 0,
  internalId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
  productName: 'SOME_NAME',
  productType: 'Orthophoto',
  additionalIdentifiers: '65adbc306ad555ca82ca12df9153dee1',
  taskCount: 1,
  completedTasks: 0,
  failedTasks: 0,
  expiredTasks: 0,
  pendingTasks: 1,
  inProgressTasks: 0,
  abortedTasks: 0,
  created: '2025-01-05T09:37:41.138Z',
  updated: '2025-01-05T09:37:41.138Z',
};

export const duplicationParams: JobExportDuplicationParams = {
  resourceId: 'SOME_NAME',
  version: '1.0',
  dbId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
  roi: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          maxResolutionDeg: 0.703125,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [34.65834368991048, 31.788041343502982],
              [34.65554554345246, 31.7828394736389],
              [34.662190174820154, 31.78261684324883],
              [34.65834368991048, 31.788041343502982],
            ],
          ],
        },
      },
    ],
  },
  crs: 'EPSG:4326',
};

export const notContainedRoi: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        maxResolutionDeg: 0.703125,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-180, -90],
            [-180, 90],
            [180, 90],
            [180, -90],
            [-180, -90],
          ],
        ],
      },
    },
  ],
};

export const completedJobResponse = [
  {
    id: '8eddc842-64ee-4e90-b3a5-b10d9e86acb2',
    resourceId: 'SOME_NAME',
    version: '1.0',
    type: 'Export',
    description: 'This is roi exporting example',
    parameters: {
      cleanupDataParams: {
        directoryPath: '63baedae-cb5b-4c0a-a7db-8eb6b9105cb7',
        cleanupExpirationTimeUTC: new Date('2025-02-01T12:28:50.000Z'),
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
                    [34.65834368991048, 31.788041343502982],
                    [34.65554554345246, 31.7828394736389],
                    [34.662190174820154, 31.78261684324883],
                    [34.65834368991048, 31.788041343502982],
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
          dataURI: 'http://download-service/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.gpkg',
          metadataURI:
            'http://download-service/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.json',
        },
        status: OperationStatus.COMPLETED,
        fileSize: 77824,
        artifacts: [
          {
            url: 'http://download-service/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.gpkg',
            name: 'Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.gpkg',
            size: 77824,
            type: 'GPKG',
          },
          {
            url: 'http://download-service/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.json',
            name: 'Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.json',
            size: 1312,
            type: 'METADATA',
          },
        ],
        description: 'This is roi exporting example',
        expirationTime: new Date('2025-02-01T12:28:50.000Z'),
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
                    [34.65834368991048, 31.788041343502982],
                    [34.65554554345246, 31.7828394736389],
                    [34.662190174820154, 31.78261684324883],
                    [34.65834368991048, 31.788041343502982],
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
    status: OperationStatus.COMPLETED,
    percentage: 100,
    reason: '',
    domain: 'RASTER',
    isCleaned: false,
    priority: 0,
    internalId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
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
  {
    id: '8eddc842-64ee-4e90-b3a5-b10d9e86acb2',
    resourceId: 'SOME_NAME',
    version: '1.0',
    type: 'Export',
    description: 'This is roi exporting example',
    parameters: {
      cleanupDataParams: {
        directoryPath: '63baedae-cb5b-4c0a-a7db-8eb6b9105cb7',
        cleanupExpirationTimeUTC: new Date('2026-02-01T12:28:50.000Z'),
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
                    [34.639025450061524, 31.79792172001403],
                    [34.646806709831, 31.79792172001403],
                    [34.646806709831, 31.80140460744333],
                    [34.639025450061524, 31.80140460744333],
                    [34.639025450061524, 31.79792172001403],
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
          dataURI: 'http://download-service/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.gpkg',
          metadataURI:
            'http://download-service/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.json',
        },
        status: OperationStatus.COMPLETED,
        fileSize: 77824,
        artifacts: [
          {
            url: 'http://download-service/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.gpkg',
            name: 'Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.gpkg',
            size: 77824,
            type: 'GPKG',
          },
          {
            url: 'http://download-service/downloads/63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_02T12_22_56_272Z.json',
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
                    [34.639025450061524, 31.79792172001403],
                    [34.646806709831, 31.79792172001403],
                    [34.646806709831, 31.80140460744333],
                    [34.639025450061524, 31.80140460744333],
                    [34.639025450061524, 31.79792172001403],
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
    status: OperationStatus.COMPLETED,
    percentage: 100,
    reason: '',
    domain: 'RASTER',
    isCleaned: false,
    priority: 0,
    internalId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
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

export const createExportData: IExportInitRequest = {
  crs: 'EPSG:4326',
  roi: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          maxResolutionDeg: 0.703125,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-180, -90],
              [-180, 90],
              [180, 90],
              [180, -90],
              [-180, -90],
            ],
          ],
        },
      },
    ],
  },
  callbacks: [
    {
      url: 'http://example.getmap.com/callback',
    },
    {
      url: 'http://example.getmap.com/callback2',
    },
  ],
  fileNamesTemplates: {
    dataURI: 'Orthophoto_SOME_NAME_1_0_0_2025_01_06T09_29_04_933Z.gpkg',
    metadataURI: 'Orthophoto_SOME_NAME_1_0_0_2025_01_06T09_29_04_933Z.json',
  },
  relativeDirectoryPath: 'e315e6d204d92b1d2dbfdaab96ff2a7e',
  packageRelativePath: 'e315e6d204d92b1d2dbfdaab96ff2a7e/Orthophoto_SOME_NAME_1_0_0_2025_01_06T09_29_04_933Z.gpkg',
  dbId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
  version: '1.0',
  cswProductId: 'SOME_NAME',
  productType: ProductType.ORTHOPHOTO,
  priority: 0,
  description: 'This is roi exporting example',
  targetFormat: TileOutputFormat.PNG,
  outputFormatStrategy: 'mixed',
  gpkgEstimatedSize: 1111,
};

export function generateCreateJobRequest(createExportData: IExportInitRequest): CreateExportJobBody {
  return {
    resourceId: createExportData.cswProductId,
    version: createExportData.version,
    type: 'Export',
    domain: 'RASTER',
    parameters: {
      exportInputParams: {
        roi: createExportData.roi,
        callbackUrls: createExportData.callbacks,
        crs: 'EPSG:4326',
      },
      additionalParams: {
        fileNamesTemplates: createExportData.fileNamesTemplates,
        relativeDirectoryPath: createExportData.relativeDirectoryPath,
        packageRelativePath: createExportData.packageRelativePath,
        outputFormatStrategy: createExportData.outputFormatStrategy,
        targetFormat: createExportData.targetFormat,
        gpkgEstimatedSize: createExportData.gpkgEstimatedSize,
      },
    },
    internalId: createExportData.dbId,
    productType: createExportData.productType,
    productName: createExportData.cswProductId,
    priority: createExportData.priority,
    description: createExportData.description,
    status: OperationStatus.PENDING,
    percentage: 0,
    additionalIdentifiers: createExportData.relativeDirectoryPath,
    tasks: [
      {
        type: 'init',
        parameters: {
          blockDuplication: true,
        },
      },
    ],
  };
}

export const createJobResponse: ICreateJobResponse = {
  id: '15598cfc-a354-4eaa-b3f3-6029d40ddf6c',
  taskIds: ['8e504935-d034-43fd-bbb1-984ce9b7ba37'],
};

export const initExportRequestBody = {
  resourceId: 'SOME_NAME',
  version: '1.0',
  type: 'Export',
  domain: 'RASTER',
  parameters: {
    exportInputParams: {
      roi: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              maxResolutionDeg: 0.703125,
            },
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
          },
        ],
      },
      callbackUrls: undefined,
      crs: 'EPSG:4326',
    },
    additionalParams: {
      fileNamesTemplates: {
        dataURI: 'Orthophoto_SOME_NAME_1_0_0_2025_01_09T10_04_06_711Z.gpkg',
        metadataURI: 'Orthophoto_SOME_NAME_1_0_0_2025_01_09T10_04_06_711Z.json',
      },
      relativeDirectoryPath: '63baedae-cb5b-4c0a-a7db-8eb6b9105cb7',
      packageRelativePath: '63baedae-cb5b-4c0a-a7db-8eb6b9105cb7/Orthophoto_SOME_NAME_1_0_0_2025_01_09T10_04_06_711Z.gpkg',
      outputFormatStrategy: TileFormatStrategy.MIXED,
      targetFormat: TileOutputFormat.PNG,
      gpkgEstimatedSize: 12500,
    },
  },
  internalId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
  productType: ProductType.ORTHOPHOTO,
  productName: 'SOME_NAME',
  priority: 1000,
  description: undefined,
  status: OperationStatus.PENDING,
  percentage: 0,
  additionalIdentifiers: '63baedae-cb5b-4c0a-a7db-8eb6b9105cb7',
  tasks: [
    {
      type: 'init',
      parameters: {
        blockDuplication: true,
      },
    },
  ],
};

export const initExportResponse = {
  id: 'ef1a76e2-3a4b-49e6-90ee-e97c402dd3d8',
  taskIds: ['0dece32e-b04e-41cb-b133-f4d1a7e960a4'],
};

export const initExportRequestBodyNoRoiWithCallback = {
  resourceId: 'SOME_NAME',
  version: '1.0',
  type: 'Export',
  domain: 'RASTER',
  parameters: {
    exportInputParams: {
      roi: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              maxResolutionDeg: 0.703125,
            },
            geometry: {
              type: 'Polygon',
              bbox: [34.85149443279957, 32.29430955805424, 34.86824157112912, 32.30543192283443],
              coordinates: [
                [
                  [34.85149445922802, 32.29430958448269],
                  [34.85149443279957, 32.2943098528153],
                  [34.85149443279957, 32.305431628073364],
                  [34.85149445922802, 32.30543189640598],
                  [34.851494727560635, 32.30543192283443],
                  [34.86824127636805, 32.30543192283443],
                  [34.868241544700666, 32.30543189640598],
                  [34.86824157112912, 32.305431628073364],
                  [34.86824157112912, 32.2943098528153],
                  [34.868241544700666, 32.29430958448269],
                  [34.86824127636805, 32.29430955805424],
                  [34.851494727560635, 32.29430955805424],
                  [34.85149445922802, 32.29430958448269],
                ],
              ],
            },
          },
        ],
      },
      callbackUrls: [
        {
          url: 'http://callback1',
        },
      ],
      crs: 'EPSG:4326',
    },
    additionalParams: {
      fileNamesTemplates: {
        dataURI: 'Orthophoto_SOME_NAME_1_0_0_2025_01_09T12_39_36_961Z.gpkg',
        metadataURI: 'Orthophoto_SOME_NAME_1_0_0_2025_01_09T12_39_36_961Z.json',
      },
      relativeDirectoryPath: 'b30e5a99b78a6c10e65164fd54b14ad0',
      packageRelativePath: 'b30e5a99b78a6c10e65164fd54b14ad0/Orthophoto_SOME_NAME_1_0_0_2025_01_09T12_39_36_961Z.gpkg',
      outputFormatStrategy: TileFormatStrategy.MIXED,
      targetFormat: TileOutputFormat.PNG,
      gpkgEstimatedSize: 12500,
    },
  },
  internalId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
  productType: 'Orthophoto',
  productName: 'SOME_NAME',
  priority: 1000,
  description: undefined,
  status: 'Pending',
  percentage: 0,
  additionalIdentifiers: 'b30e5a99b78a6c10e65164fd54b14ad0',
  tasks: [
    {
      type: 'init',
      parameters: {
        blockDuplication: true,
      },
    },
  ],
};
