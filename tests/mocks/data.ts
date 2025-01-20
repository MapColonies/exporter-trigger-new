/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ProductType, RecordType } from '@map-colonies/mc-model-types';
import { BBox, FeatureCollection, Polygon } from 'geojson';
import { OperationStatus } from '@map-colonies/mc-priority-queue';
import { TileOutputFormat, Transparency } from '@map-colonies/raster-shared';
import { ICreateExportJobResponse, ICreateExportRequest, IGeometryRecord, JobExportDuplicationParams } from '../../src/common/interfaces';

const dbId = '8b867544-2dab-43a1-be6e-f23ec83c19b4';
const crs = 'EPSG:4326';

const defaultRoi: FeatureCollection = {
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
};

const notIntersectedPolygon: FeatureCollection = {
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
            [34.94222600858711, 32.36620011311199],
            [34.957210576149464, 32.35918524263104],
            [34.95777020643541, 32.36966124266523],
            [34.94222600858711, 32.36620011311199],
          ],
        ],
      },
    },
  ],
};

export const layerInfo = {
  links: [
    {
      name: 'SOME_NAME-Orthophoto',
      protocol: 'WMS',
      url: 'https://tiles-dev.mapcolonies.net/api/raster/v1/service?REQUEST=GetCapabilities',
    },
    {
      name: 'SOME_NAME-Orthophoto',
      protocol: 'WMS_BASE',
      url: 'https://tiles-dev.mapcolonies.net/api/raster/v1/wms',
    },
    {
      name: 'SOME_NAME-Orthophoto',
      protocol: 'WMTS',
      url: 'https://tiles-dev.mapcolonies.net/api/raster/v1/wmts/1.0.0/WMTSCapabilities.xml',
    },
    {
      name: 'SOME_NAME-Orthophoto',
      protocol: 'WMTS_KVP',
      url: 'https://tiles-dev.mapcolonies.net/api/raster/v1/service?REQUEST=GetCapabilities&SERVICE=WMTS',
    },
    {
      name: 'SOME_NAME-Orthophoto',
      protocol: 'WMTS_BASE',
      url: 'https://tiles-dev.mapcolonies.net/api/raster/v1/wmts',
    },
    {
      name: 'SOME_NAME-Orthophoto',
      protocol: 'WFS',
      url: 'https://polygon-parts-dev.mapcolonies.net/api/raster/v1/wfs?request=GetCapabilities',
    },
  ],
  metadata: {
    id: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
    type: RecordType.RECORD_RASTER,
    classification: '6',
    productName: 'string',
    description: 'string',
    srs: '4326',
    producerName: 'string',
    creationDateUTC: '2025-01-02T11:51:18.140Z',
    ingestionDate: '2025-01-02T11:51:18.140Z',
    updateDateUTC: '2025-01-02T09:51:18.140Z',
    imagingTimeBeginUTC: '2024-01-28T13:47:43.427Z',
    imagingTimeEndUTC: '2024-01-28T13:47:43.427Z',
    maxHorizontalAccuracyCE90: 10,
    minHorizontalAccuracyCE90: 10,
    sensors: ['string'],
    region: ['string'],
    productId: 'SOME_NAME',
    productVersion: '1.0',
    productType: ProductType.ORTHOPHOTO,
    productSubType: 'string',
    srsName: 'WGS84GEO',
    maxResolutionDeg: 0.703125,
    minResolutionDeg: 0.703125,
    maxResolutionMeter: 8000,
    minResolutionMeter: 8000,
    scale: 100000000,
    footprint: {
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
    productBoundingBox: '34.851494432799569,32.294309558054238,34.868241571129118,32.305431922834430',
    displayPath: 'f76fde12-121d-4b66-b5b9-732ef92e2eda',
    transparency: Transparency.Transparent,
    tileMimeFormat: 'image/png',
    tileOutputFormat: TileOutputFormat.PNG,
  },
};

export const fcTooHighResolution: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { maxResolutionDeg: 0.000000335276126861572 },
      geometry: {
        coordinates: [
          [
            [37.42414218385065, 17.95036866237062],
            [30.42608533411871, 17.95036866237062],
            [30.42608533411871, 11.52904501530621],
            [37.42414218385065, 11.52904501530621],
            [37.42414218385065, 17.95036866237062],
          ],
        ],
        type: 'Polygon',
      },
    },
  ],
};

export const fc1: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { maxResolutionDeg: 0.02197265625 },
      geometry: {
        coordinates: [
          [
            [37.42414218385065, 17.95036866237062],
            [30.42608533411871, 17.95036866237062],
            [30.42608533411871, 11.52904501530621],
            [37.42414218385065, 11.52904501530621],
            [37.42414218385065, 17.95036866237062],
          ],
        ],
        type: 'Polygon',
      },
    },
    {
      type: 'Feature',
      properties: { maxResolutionDeg: 0.02197265625 },
      geometry: {
        coordinates: [
          [
            [29.726720838716574, -10.646156974961286],
            [25.120393802953117, -10.646156974961286],
            [25.120393802953117, -16.979479051947962],
            [29.726720838716574, -16.979479051947962],
            [29.726720838716574, -10.646156974961286],
          ],
        ],
        type: 'Polygon',
      },
    },
  ],
};

export const validateFeatureCollection = {
  validRequest: {
    featuresRecords: [
      {
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-90, -90],
              [90, -90],
              [90, 90],
              [-90, 90],
              [-90, -90],
            ],
          ],
        },
        targetResolutionDeg: 0.703125,
        targetResolutionMeter: 78271.52,
        minResolutionDeg: 0.703125,
        minZoomLevel: 0,
        zoomLevel: 0,
      },
    ] as IGeometryRecord[],
    footprint: {
      type: 'Polygon',
      bbox: [-180, -90, 180, 90],
      coordinates: [
        [
          [-180, -90],
          [-180, 90],
          [180, 90],
          [180, -90],
          [-180, -90],
        ],
      ],
    } as Polygon,
    maxZomm: 0,
    srcRes: 0.703125,
    sanitizedBox: [-180, -90, 180, 90] as BBox,
  },
  invalid: {
    notIntersected: {
      featuresRecords: [
        {
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-146.80460864627938, -55.00665477606888],
                [-121.46405521949563, -55.00665477606888],
                [-121.46405521949563, -44.35618678215676],
                [-146.80460864627938, -44.35618678215676],
                [-146.80460864627938, -55.00665477606888],
              ],
            ],
          },
          targetResolutionDeg: 0.703125,
          targetResolutionMeter: 78271.52,
          minResolutionDeg: 0.703125,
          minZoomLevel: 0,
          zoomLevel: 0,
        },
      ] as IGeometryRecord[],
      footprint: {
        type: 'Polygon',
        bbox: [-90, -90, 90, 90],
        coordinates: [
          [
            [-90, -90],
            [90, -90],
            [90, 90],
            [-90, 90],
            [-90, -90],
          ],
        ],
      } as Polygon,
      maxZomm: 0,
      srcRes: 0.703125,
    },
  },
};

// Constants
export const dupParams = {
  resourceId: 'SOME_NAME',
  version: '1.0',
  dbId,
  roi: defaultRoi,
  crs,
} as JobExportDuplicationParams;

export const createExportRequestWithoutCallback: ICreateExportRequest = {
  dbId,
  crs,
  roi: defaultRoi,
};

export const createExportRequestNoRoiWithCallback: ICreateExportRequest = {
  dbId,
  callbackURLs: ['http://callback1'],
};

export const createExportRequestWithRoiAndCallback: ICreateExportRequest = {
  dbId,
  callbackURLs: ['http://example.getmap.com/callback', 'http://example.getmap.com/callback2'],
  roi: defaultRoi,
};

export const createExportRequestWithRoiAndNewCallback: ICreateExportRequest = {
  dbId,
  callbackURLs: ['http://example.getmap.com/callback3'],
  roi: defaultRoi,
};

export const createExportInvalidMaxZoomLevel: ICreateExportRequest = {
  dbId,
  crs,
  roi: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          maxResolutionDeg: 0.0439453125,
        },
        geometry: defaultRoi.features[0].geometry,
      },
    ],
  },
};

export const createExportInvalidMinZoomLevel: ICreateExportRequest = {
  dbId,
  crs,
  roi: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          maxResolutionDeg: 0.703125,
          minResolutionDeg: 0.1,
        },
        geometry: defaultRoi.features[0].geometry,
      },
    ],
  },
};

export const createExportNotIntersectedPolygon: ICreateExportRequest = {
  dbId,
  crs,
  roi: notIntersectedPolygon,
};

export const createExportResponse: ICreateExportJobResponse = {
  jobId: 'ef1a76e2-3a4b-49e6-90ee-e97c402dd3d8',
  taskIds: ['0dece32e-b04e-41cb-b133-f4d1a7e960a4'],
  status: OperationStatus.PENDING,
};

// export const dupParams = {
//   resourceId: 'SOME_NAME',
//   version: '1.0',
//   dbId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
//   roi: {
//     type: 'FeatureCollection',
//     features: [
//       {
//         type: 'Feature',
//         properties: {
//           maxResolutionDeg: 0.703125,
//         },
//         geometry: {
//           type: 'Polygon',
//           coordinates: [
//             [
//               [34.85671849225366, 32.306563240778644],
//               [34.858090125180894, 32.30241218787266],
//               [34.862337900781455, 32.30263664191864],
//               [34.86154145051941, 32.30708703329364],
//               [34.85671849225366, 32.306563240778644],
//             ],
//           ],
//         },
//       },
//     ],
//   },
//   crs: 'EPSG:4326',
// } as JobExportDuplicationParams;

// export const createExportRequestWithoutCallback: ICreateExportRequest = {
//   dbId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
//   crs: 'EPSG:4326',
//   roi: {
//     type: 'FeatureCollection',
//     features: [
//       {
//         type: 'Feature',
//         properties: {
//           maxResolutionDeg: 0.703125,
//         },
//         geometry: {
//           type: 'Polygon',
//           coordinates: [
//             [
//               [34.85671849225366, 32.306563240778644],
//               [34.858090125180894, 32.30241218787266],
//               [34.862337900781455, 32.30263664191864],
//               [34.86154145051941, 32.30708703329364],
//               [34.85671849225366, 32.306563240778644],
//             ],
//           ],
//         },
//       },
//     ],
//   },
// };

// export const createExportRequestNoRoiWithCallback: ICreateExportRequest = {
//   dbId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
//   callbackURLs: ['http://callback1'],
// };

// export const createExportRequestWithRoiAndCallback: ICreateExportRequest = {
//   dbId: createExportRequestNoRoiWithCallback.dbId,
//   callbackURLs: ['http://example.getmap.com/callback', 'http://example.getmap.com/callback2'],
//   roi: createExportRequestWithoutCallback.roi,
// };

// export const createExportRequestWithRoiAndNewCallback: ICreateExportRequest = {
//   dbId: createExportRequestNoRoiWithCallback.dbId,
//   callbackURLs: ['http://example.getmap.com/callback3'],
//   roi: createExportRequestWithoutCallback.roi,
// };

// export const createExportInvalidMaxZoomLevel: ICreateExportRequest = {
//   dbId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
//   crs: 'EPSG:4326',
//   roi: {
//     type: 'FeatureCollection',
//     features: [
//       {
//         type: 'Feature',
//         properties: {
//           maxResolutionDeg: 0.0439453125,
//         },
//         geometry: {
//           type: 'Polygon',
//           coordinates: [
//             [
//               [34.85671849225366, 32.306563240778644],
//               [34.858090125180894, 32.30241218787266],
//               [34.862337900781455, 32.30263664191864],
//               [34.86154145051941, 32.30708703329364],
//               [34.85671849225366, 32.306563240778644],
//             ],
//           ],
//         },
//       },
//     ],
//   },
// };

// export const createExportInvalidMinZoomLevel: ICreateExportRequest = {
//   dbId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
//   crs: 'EPSG:4326',
//   roi: {
//     type: 'FeatureCollection',
//     features: [
//       {
//         type: 'Feature',
//         properties: {
//           maxResolutionDeg: 0.703125,
//           minResolutionDeg: 0.1,
//         },
//         geometry: {
//           type: 'Polygon',
//           coordinates: [
//             [
//               [34.85671849225366, 32.306563240778644],
//               [34.858090125180894, 32.30241218787266],
//               [34.862337900781455, 32.30263664191864],
//               [34.86154145051941, 32.30708703329364],
//               [34.85671849225366, 32.306563240778644],
//             ],
//           ],
//         },
//       },
//     ],
//   },
// };

// export const createExportNotIntersectedPolygon: ICreateExportRequest = {
//   dbId: '8b867544-2dab-43a1-be6e-f23ec83c19b4',
//   crs: 'EPSG:4326',
//   roi: {
//     type: 'FeatureCollection',
//     features: [
//       {
//         type: 'Feature',
//         properties: {
//           maxResolutionDeg: 0.703125,
//         },
//         geometry: {
//           type: 'Polygon',
//           coordinates: [
//             [
//               [34.94222600858711, 32.36620011311199],
//               [34.957210576149464, 32.35918524263104],
//               [34.95777020643541, 32.36966124266523],
//               [34.94222600858711, 32.36620011311199],
//             ],
//           ],
//         },
//       },
//     ],
//   },
// };
