import httpStatusCodes from 'http-status-codes';
import { configMock } from '@tests/mocks/config';
import nock from 'nock';
import { inProgressJobsResponse } from '@tests/mocks/requestMocks/processingRequest';
import { JobExportResponse } from '@map-colonies/raster-shared';
import { getJobStatusByIdResponse } from '@tests/mocks/data/jobMocks';
import { initConfig } from '@src/common/config';
import { getApp } from '../../../src/app';
import { getTestContainerConfig, resetContainer } from '../testContainerConfig';
import { TasksSender } from './helpers/tasksSender';

const jobRequest = inProgressJobsResponse[0] as unknown as JobExportResponse;

describe('tasks', function () {
  let requestSender: TasksSender;
  let jobManagerURL: string;

  beforeAll(async function () {
    await initConfig(true);
  });

  beforeEach(async function () {
    const [app] = await getApp({
      override: [...getTestContainerConfig()],
      useChild: true,
    });
    requestSender = new TasksSender(app);
    jobManagerURL = configMock.get<string>('externalClientsConfig.clientsUrls.jobManager.url');
  });

  afterEach(function () {
    resetContainer();
    jest.resetAllMocks();
  });

  describe('Happy Path', function () {
    it('should return 200 status code and the tasks matched the jobId', async function () {
      nock(jobManagerURL).get(`/jobs/${jobRequest.id}`).reply(200, jobRequest);

      const response = await requestSender.getStatusByJobId(jobRequest.id);

      expect(response.body).toEqual(getJobStatusByIdResponse);

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.OK);
    });
  });

  describe('Sad Path', function () {
    it('should return 500 status code when internalServerError from job Manager', async function () {
      nock(jobManagerURL).get(`/jobs/${jobRequest.id}`).reply(500);
      const resposne = await requestSender.getStatusByJobId(jobRequest.id);

      expect(resposne).toSatisfyApiSpec();
      expect(resposne.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      expect.assertions(2);
    });
  });

  describe('Bad Path', function () {
    it('should return 400 status code when jobId is not a valid uuid', async function () {
      const jobId = 'string';

      const resposne = await requestSender.getStatusByJobId(jobId);

      expect(resposne).toSatisfyApiSpec();
      expect(resposne.status).toBe(httpStatusCodes.BAD_REQUEST);
    });

    it('should return 404 status code when no job was found', async function () {
      nock(jobManagerURL).get(`/jobs/${jobRequest.id}`).reply(404);

      const response = await requestSender.getStatusByJobId(jobRequest.id);

      expect(response).toSatisfyApiSpec();
      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
      expect.assertions(2);
    });
  });
});
