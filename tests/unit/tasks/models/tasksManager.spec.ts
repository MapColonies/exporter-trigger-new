import jsLogger from '@map-colonies/js-logger';
import { NotFoundError } from '@map-colonies/error-types';
import { trace } from '@opentelemetry/api';
import nock from 'nock';
import { getJobStatusByIdResponse } from '@tests/mocks/data/jobMocks';
import { inProgressJobsResponse } from '@tests/mocks/requestMocks/processingRequest';
import { JobExportResponse } from '@map-colonies/raster-shared';
import { ExportStatusHandler } from '../../../../src/tasks/models/tasksManager';
import { configMock, registerDefaultConfig } from '../../../mocks/config';
import { JobManagerWrapper } from '../../../../src/clients/jobManagerWrapper';

let exportStatusHandler: ExportStatusHandler;
const jobRequest = inProgressJobsResponse[0] as unknown as JobExportResponse;

describe('TasksManager', () => {
  registerDefaultConfig();
  const jobManagerURL = configMock.get<string>('externalClientsConfig.clientsUrls.jobManager.url');
  beforeEach(() => {
    registerDefaultConfig();
    const logger = jsLogger({ enabled: false });

    const jobManagerWrapper = new JobManagerWrapper(logger, trace.getTracer('testTracer'));
    exportStatusHandler = new ExportStatusHandler(logger, trace.getTracer('testTracer'), jobManagerWrapper);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('#getJobStatusByJobId', () => {
    it('should successfully return job status by jobId', async () => {
      nock(jobManagerURL).get(`/jobs/${jobRequest.id}`).reply(200, jobRequest);

      const response = await exportStatusHandler.getJobStatusByJobId(jobRequest.id);

      expect(response).toEqual(getJobStatusByIdResponse);
    });
    it('should throw NotFoundError when jobId doesnt exist', async () => {
      nock(jobManagerURL).get(`/jobs/${jobRequest.id}`).reply(404, []);

      const action = async () => exportStatusHandler.getJobStatusByJobId(jobRequest.id);

      await expect(action()).rejects.toThrow(NotFoundError);
    });
  });
});
