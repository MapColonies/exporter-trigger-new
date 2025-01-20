import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import { container } from 'tsyringe';

import {
  completedJobResponse,
  createExportData,
  createJobResponse,
  duplicationParams,
  generateCreateJobRequest,
  getJobStatusByIdResponse,
  inProgressJobResponse,
  notContainedRoi,
} from '@tests/mocks/data/jobMocks';
import { NotFoundError } from '@map-colonies/error-types';
import { OperationStatus } from '@map-colonies/mc-priority-queue';
import { JobExportDuplicationParams } from '@src/common/interfaces';
import { inProgressJobsResponse } from '@tests/mocks/requestMocks/processingRequest';
import { SERVICES } from '../../../src/common/constants';
import { registerDefaultConfig } from '../../mocks/config';
import { JobManagerWrapper } from '../../../src/clients/jobManagerWrapper';

let jobManagerClient: JobManagerWrapper;
let put: jest.Mock;
let post: jest.Mock;
let get: jest.Mock;
let createJob: jest.Mock;

describe('JobManagerClient', () => {
  beforeEach(() => {
    const logger = jsLogger({ enabled: false });
    registerDefaultConfig();
    jobManagerClient = new JobManagerWrapper(logger, trace.getTracer('testTracer'));
    container.register(SERVICES.LOGGER, { useValue: logger });
  });

  afterEach(() => {
    container.clearInstances();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('Get jobs by job id', () => {
    it('should return job percentage and status by id', async () => {
      get = jest.fn();
      (jobManagerClient as unknown as { get: unknown }).get = get.mockResolvedValue(getJobStatusByIdResponse);
      const response = await jobManagerClient.getJobByJobId(inProgressJobResponse.id);
      expect(get).toHaveBeenCalledTimes(1);
      expect(response).toBeDefined();
    });

    it('should throw NotFound error on non-existed job', async () => {
      get = jest.fn();
      (jobManagerClient as unknown as { get: unknown }).get = get.mockRejectedValue(new NotFoundError('Job not found'));
      const action = async () => jobManagerClient.getJobByJobId(inProgressJobResponse.id);
      await expect(action()).rejects.toThrow(NotFoundError);
      expect(get).toHaveBeenCalledTimes(1);
    });
  });

  describe('findExportJob', () => {
    it('should return completed job for export request', async () => {
      get = jest.fn();
      (jobManagerClient as unknown as { get: unknown }).get = get.mockResolvedValue(completedJobResponse);
      const response = await jobManagerClient.findExportJob(OperationStatus.COMPLETED, duplicationParams);
      expect(get).toHaveBeenCalledTimes(1);
      expect(response).toEqual(completedJobResponse[0]);
    });

    it('should return undefined on roi not contained in a completed job', async () => {
      const notContainedDuplicationParams: JobExportDuplicationParams = { ...duplicationParams, roi: notContainedRoi };
      get = jest.fn();
      (jobManagerClient as unknown as { get: unknown }).get = get.mockResolvedValue(completedJobResponse);
      const response = await jobManagerClient.findExportJob(OperationStatus.COMPLETED, notContainedDuplicationParams);
      expect(get).toHaveBeenCalledTimes(1);
      expect(response).toBeUndefined();
    });

    it('should return undefined when no completed jobs where found', async () => {
      get = jest.fn();
      (jobManagerClient as unknown as { get: unknown }).get = get.mockResolvedValue(undefined);
      const response = await jobManagerClient.findExportJob(OperationStatus.COMPLETED, duplicationParams);
      expect(get).toHaveBeenCalledTimes(1);
      expect(response).toBeUndefined();
    });
  });

  describe('validateAndUpdateExpiration', () => {
    it('should update expirationDate', async () => {
      get = jest.fn();
      put = jest.fn();
      (jobManagerClient as unknown as { put: unknown }).put = put.mockResolvedValue(undefined);
      (jobManagerClient as unknown as { get: unknown }).get = get.mockResolvedValue(completedJobResponse[0]);

      const action = async () => {
        await jobManagerClient.validateAndUpdateExpiration(completedJobResponse[0].id);
      };
      await expect(action()).resolves.not.toThrow();
      expect(get).toHaveBeenCalledTimes(1);
      expect(put).toHaveBeenCalledTimes(1);
    });

    it('should not update expirationDate', async () => {
      get = jest.fn();
      put = jest.fn();
      (jobManagerClient as unknown as { put: unknown }).put = put.mockResolvedValue(undefined);
      (jobManagerClient as unknown as { get: unknown }).get = get.mockResolvedValue(completedJobResponse[1]);
      const action = async () => {
        await jobManagerClient.validateAndUpdateExpiration(completedJobResponse[0].id);
      };
      await expect(action()).resolves.not.toThrow();
      expect(get).toHaveBeenCalledTimes(1);
      expect(put).toHaveBeenCalledTimes(0);
    });

    describe('createExportJob', () => {
      it('should post a new init export request', async () => {
        createJob = jest.fn();

        (jobManagerClient as unknown as { createJob: unknown }).createJob = createJob.mockResolvedValue(createJobResponse);

        const result = await jobManagerClient.createExportJob(createExportData);
        expect(result).toEqual({ jobId: createJobResponse.id, taskIds: createJobResponse.taskIds, status: OperationStatus.PENDING });
        expect(createJob).toHaveBeenCalledWith(generateCreateJobRequest(createExportData));
      });
    });

    describe('findByCriteria', () => {
      it('should post a new init export request', async () => {
        post = jest.fn();
        (jobManagerClient as unknown as { post: unknown }).post = post.mockResolvedValue(inProgressJobsResponse);
        const response = await jobManagerClient.findAllProcessingExportJobs();
        expect(post).toHaveBeenCalledTimes(1);
        expect(response).toEqual(inProgressJobsResponse);
      });
    });
  });
});
