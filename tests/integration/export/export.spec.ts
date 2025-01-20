import { v4 as uuidv4 } from 'uuid';
import httpStatusCodes from 'http-status-codes';
import { initConfig } from '@src/common/config';
import { configMock } from '@tests/mocks/config';
import {
  createExportInvalidMaxZoomLevel,
  createExportInvalidMinZoomLevel,
  createExportNotIntersectedPolygon,
  createExportRequestNoRoiWithCallback,
  createExportRequestWithoutCallback,
  createExportRequestWithRoiAndCallback,
  createExportRequestWithRoiAndNewCallback,
  createExportResponse,
  layerInfo,
} from '@tests/mocks/data';
import nock from 'nock';
import { initExportRequestBody, initExportRequestBodyNoRoiWithCallback, initExportResponse } from '@tests/mocks/data/jobMocks';
import { completedExportJobsResponse, completedExportParams, completedJobCallback } from '@tests/mocks/requestMocks/completedReqest';
import {
  addedCallbackUrl,
  findCriteria,
  inProgressExportParams,
  inProgressJobsResponse,
  pendingExportParams,
  processingResponse,
} from '@tests/mocks/requestMocks/processingRequest';
import { ValidationManager } from '@src/export/models/validationManager';
import { CallbackUrlsTargetArray, ExportJobParameters } from '@map-colonies/raster-shared';
import { getTestContainerConfig, resetContainer } from '../testContainerConfig';
import { getApp } from '../../../src/app';
import { ExportSender } from './helpers/exportSender';
//import { container } from 'tsyringe';
import { SERVICES } from '@src/common/constants';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('export', function () {
  let requestSender: ExportSender;
  let catalogManagerURL: string;
  let jobManagerURL: string;
  //let depContainer: DependencyContainer;

  beforeAll(async function () {
    await initConfig(true);
  });

  beforeEach(async function () {
    //container.clearInstances();
    const [app, container] = await getApp({
      override: [...getTestContainerConfig()],
      useChild: false,
    });
    requestSender = new ExportSender(app);
    catalogManagerURL = configMock.get<string>('externalClientsConfig.clientsUrls.rasterCatalogManager.url');
    jobManagerURL = configMock.get<string>('externalClientsConfig.clientsUrls.jobManager.url');
    //const logger = container.resolve<Logger>(SERVICES.LOGGER);

    console.log(container.isRegistered(SERVICES.LOGGER));
    // logger.info('testtttttttttttttttttttttttttttttttttttttt');
  });

  afterEach(function () {
    resetContainer();
    jest.resetAllMocks();
  });

  describe('Happy Path', function () {
    it('should return 200 status code and create an export init', async function () {
      const layerId = createExportRequestWithoutCallback.dbId;
      (uuidv4 as jest.Mock).mockReturnValue(initExportRequestBody.additionalIdentifiers);
      jest.spyOn(Date.prototype, 'toJSON').mockReturnValue('2025_01_09T10_04_06_711Z');
      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);
      nock(jobManagerURL)
        .get('/jobs')
        .query(completedExportParams as Record<string, string>)
        .reply(200, undefined);
      nock(jobManagerURL)
        .get('/jobs')
        .query(inProgressExportParams as Record<string, string>)
        .reply(200, undefined);
      nock(jobManagerURL)
        .get('/jobs')
        .query(pendingExportParams as Record<string, string>)
        .reply(200, undefined);
      nock(jobManagerURL)
        .post(`/jobs/find`, findCriteria as Record<string, string>)
        .reply(200, inProgressJobsResponse);

      nock(jobManagerURL).post(`/jobs`, initExportRequestBody).reply(200, initExportResponse);

      const response = await requestSender.export(createExportRequestWithoutCallback);

      expect(response.body).toEqual(createExportResponse);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response).toSatisfyApiSpec();
    }, 5000000);

    it('should return 200 status code and return completed job', async function () {
      const layerId = createExportRequestWithoutCallback.dbId;

      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);
      nock(jobManagerURL)
        .get('/jobs')
        .query(completedExportParams as Record<string, string>)
        .reply(200, completedExportJobsResponse);
      nock(jobManagerURL).get(`/jobs/${completedExportJobsResponse[0].id}`).reply(200, completedExportJobsResponse[0]);

      const response = await requestSender.export(createExportRequestWithoutCallback);

      expect(response.body).toEqual(completedJobCallback);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response).toSatisfyApiSpec();
    });

    it('should return 200 status code and return completed job on race condition', async function () {
      const layerId = createExportRequestWithoutCallback.dbId;

      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);
      nock(jobManagerURL)
        .get('/jobs')
        .query(completedExportParams as Record<string, string>)
        .reply(200, []);
      nock(jobManagerURL)
        .get('/jobs')
        .query(inProgressExportParams as Record<string, string>)
        .reply(200, inProgressJobsResponse);
      nock(jobManagerURL)
        .get('/jobs')
        .query(pendingExportParams as Record<string, string>)
        .reply(200, []);

      nock(jobManagerURL)
        .get('/jobs')
        .query(completedExportParams as Record<string, string>)
        .reply(200, completedExportJobsResponse);
      nock(jobManagerURL).get(`/jobs/${completedExportJobsResponse[0].id}`).reply(200, completedExportJobsResponse[0]);

      const response = await requestSender.export(createExportRequestWithoutCallback);

      expect(response.body).toEqual(completedJobCallback);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response).toSatisfyApiSpec();
    }, 5000000);

    it('should return 200 status code and return a processing job', async function () {
      const layerId = createExportRequestWithoutCallback.dbId;

      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);
      nock(jobManagerURL)
        .get('/jobs')
        .query(completedExportParams as Record<string, string>)
        .reply(200, [])
        .persist();
      nock(jobManagerURL)
        .get('/jobs')
        .query(inProgressExportParams as Record<string, string>)
        .reply(200, inProgressJobsResponse);
      nock(jobManagerURL)
        .get('/jobs')
        .query(pendingExportParams as Record<string, string>)
        .reply(200, []);

      nock(jobManagerURL).put(`/jobs/${inProgressJobsResponse[0].id}`, JSON.stringify(inProgressJobsResponse[0].parameters)).reply(200, []);

      const response = await requestSender.export(createExportRequestWithoutCallback);

      expect(response.body).toEqual(processingResponse);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response).toSatisfyApiSpec();
    });

    it('should return 200 status code , create init job when no roi provided and with callback', async function () {
      const layerId = createExportRequestWithoutCallback.dbId;
      (uuidv4 as jest.Mock).mockReturnValue(initExportRequestBodyNoRoiWithCallback.additionalIdentifiers);

      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);
      nock(jobManagerURL)
        .get('/jobs')
        .query(completedExportParams as Record<string, string>)
        .reply(200, undefined);
      nock(jobManagerURL)
        .get('/jobs')
        .query(inProgressExportParams as Record<string, string>)
        .reply(200, undefined);
      nock(jobManagerURL)
        .get('/jobs')
        .query(pendingExportParams as Record<string, string>)
        .reply(200, undefined);
      nock(jobManagerURL)
        .post(`/jobs/find`, findCriteria as Record<string, string>)
        .reply(200, inProgressJobsResponse);

      nock(jobManagerURL).post(`/jobs`, initExportRequestBodyNoRoiWithCallback).reply(200, initExportResponse);
      jest.spyOn(Date.prototype, 'toJSON').mockReturnValue('2025_01_09T12_39_36_961Z');

      const response = await requestSender.export(createExportRequestNoRoiWithCallback);

      expect(response.body).toEqual(createExportResponse);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response).toSatisfyApiSpec();
    });
    it('should return 200 status code, return a processing job and add non duplicate callbackUrls', async function () {
      const layerId = createExportRequestNoRoiWithCallback.dbId;
      const matchingJob = [{ ...inProgressJobsResponse[0] }];
      const updatedCallbackParameters = JSON.parse(JSON.stringify(matchingJob[0].parameters)) as ExportJobParameters;
      (updatedCallbackParameters.exportInputParams.callbackUrls as CallbackUrlsTargetArray).push(addedCallbackUrl[0]);

      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);
      nock(jobManagerURL)
        .get('/jobs')
        .query(completedExportParams as Record<string, string>)
        .reply(200, [])
        .persist();
      nock(jobManagerURL)
        .get('/jobs')
        .query(inProgressExportParams as Record<string, string>)
        .reply(200, matchingJob);
      nock(jobManagerURL)
        .get('/jobs')
        .query(pendingExportParams as Record<string, string>)
        .reply(200, []);
      nock(jobManagerURL)
        .post(`/jobs/find`, findCriteria as Record<string, string>)
        .reply(200, []);

      nock(jobManagerURL)
        .put(`/jobs/${matchingJob[0].id}`, JSON.stringify({ parameters: updatedCallbackParameters }))
        .reply(200, []);

      const response = await requestSender.export(createExportRequestWithRoiAndNewCallback);

      expect(response.body).toEqual(processingResponse);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response).toSatisfyApiSpec();
    });

    it('should return 200 status code, return a processing job and add new callbackUrls', async function () {
      const layerId = createExportRequestNoRoiWithCallback.dbId;
      const matchingJob = [{ ...inProgressJobsResponse[0] }];
      // Perform a deep copy of the parameters object
      const updatedCallbackParameters = JSON.parse(JSON.stringify(matchingJob[0].parameters)) as ExportJobParameters;
      // Use type assertion to safely delete the property
      delete (matchingJob[0].parameters.exportInputParams as { callbackUrls?: unknown }).callbackUrls;
      //updatedCallbackParameters.exportInputParams.callbackUrls = addedCallbackUrl;

      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);
      nock(jobManagerURL)
        .get('/jobs')
        .query(completedExportParams as Record<string, string>)
        .reply(200, [])
        .persist();
      nock(jobManagerURL)
        .get('/jobs')
        .query(inProgressExportParams as Record<string, string>)
        .reply(200, matchingJob);
      nock(jobManagerURL)
        .get('/jobs')
        .query(pendingExportParams as Record<string, string>)
        .reply(200, []);
      nock(jobManagerURL)
        .post(`/jobs/find`, findCriteria as Record<string, string>)
        .reply(200, []);

      nock(jobManagerURL)
        .put(`/jobs/${matchingJob[0].id}`, JSON.stringify({ parameters: updatedCallbackParameters }))
        .reply(200, []);

      const response = await requestSender.export(createExportRequestWithRoiAndCallback);

      expect(response.body).toEqual(processingResponse);

      expect(response.status).toBe(httpStatusCodes.OK);
      expect(response).toSatisfyApiSpec();
    });
  });

  describe('Bad Path', function () {
    it('should return not found status code when layer not found', async function () {
      const layerId = createExportRequestWithoutCallback.dbId;

      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, []);
      const response = await requestSender.export(createExportRequestWithoutCallback);

      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
      expect(response).toSatisfyApiSpec();
    });

    it('should return bad request status code when dbId is not uuid', async function () {
      const invalidIdRequest = { ...createExportRequestWithoutCallback, dbId: 'invalid' };
      const response = await requestSender.export(invalidIdRequest);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response).toSatisfyApiSpec();
    });

    it('should return bad request status code when crs is not valid', async function () {
      const invalidIdRequest = { ...createExportRequestWithoutCallback, crs: 'invalid' };
      const response = await requestSender.export(invalidIdRequest);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response).toSatisfyApiSpec();
    });

    it('should return bad request when requested zoom level is bigger than maxZoom level', async function () {
      const layerId = createExportInvalidMaxZoomLevel.dbId;
      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);

      const response = await requestSender.export(createExportInvalidMaxZoomLevel);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response).toSatisfyApiSpec();
    });

    it('should return bad request when requested zoom level is smaller than minZoom level', async function () {
      const layerId = createExportInvalidMinZoomLevel.dbId;
      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);

      const response = await requestSender.export(createExportInvalidMinZoomLevel);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response).toSatisfyApiSpec();
    });

    it('should return bad request when requested polygon doesnt intersect with layer footprint', async function () {
      const layerId = createExportNotIntersectedPolygon.dbId;
      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);

      const response = await requestSender.export(createExportNotIntersectedPolygon);

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(response).toSatisfyApiSpec();
    });
  });

  describe('Sad Path', function () {
    it('should return internal server error when an error occurs in raster catalog', async function () {
      const layerId = createExportRequestWithoutCallback.dbId;

      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(500, []);
      const response = await requestSender.export(createExportRequestWithoutCallback);

      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(response).toSatisfyApiSpec();
    });

    it('should return internal server error when an error occurs in jobManager', async function () {
      const layerId = createExportRequestWithoutCallback.dbId;

      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);
      nock(jobManagerURL)
        .get('/jobs')
        .query(completedExportParams as Record<string, string>)
        .reply(500, []);
      const response = await requestSender.export(createExportRequestWithoutCallback);

      expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(response).toSatisfyApiSpec();
    });

    it('should return insufficient storage error when not enough', async function () {
      const layerId = createExportRequestWithoutCallback.dbId;

      nock(catalogManagerURL).post(`/records/find`, { id: layerId }).reply(200, [layerInfo]);
      nock(jobManagerURL)
        .get('/jobs')
        .query(completedExportParams as Record<string, string>)
        .reply(200, undefined);
      nock(jobManagerURL)
        .get('/jobs')
        .query(inProgressExportParams as Record<string, string>)
        .reply(200, undefined);
      nock(jobManagerURL)
        .get('/jobs')
        .query(pendingExportParams as Record<string, string>)
        .reply(200, undefined);
      nock(jobManagerURL)
        .post(`/jobs/find`, findCriteria as Record<string, string>)
        .reply(200, inProgressJobsResponse);

      jest.spyOn(ValidationManager.prototype as unknown as { getFreeStorage: () => Promise<number> }, 'getFreeStorage').mockResolvedValue(1);

      const response = await requestSender.export(createExportRequestWithoutCallback);

      expect(response.status).toBe(httpStatusCodes.INSUFFICIENT_STORAGE);
      expect(response).toSatisfyApiSpec();
    });
  });
});
