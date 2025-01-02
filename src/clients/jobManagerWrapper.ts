import { inject, injectable } from 'tsyringe';
import config from 'config';
import { Logger } from '@map-colonies/js-logger';
import { IFindJobsRequest, JobManagerClient, OperationStatus } from '@map-colonies/mc-priority-queue';
import { getUTCDate, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Tracer } from '@opentelemetry/api';
import { withSpanAsyncV4 } from '@map-colonies/telemetry';
import { ExportJobParameters, JobExportResponse } from '@map-colonies/raster-shared';
import {
  CreateExportJobBody,
  GetJobResponse,
  ICreateExportJobResponse,
  IExportInitRequest,
  ITaskParameters,
  JobExportDuplicationParams,
} from '../common/interfaces';
import { SERVICES } from '../common/constants';
import { checkFeatures } from '../utils/geometry';

//TODO: GetJobResponse from raster-shared
@injectable()
export class JobManagerWrapper extends JobManagerClient {
  private readonly tilesJobType: string;
  private readonly tilesTaskType: string;
  private readonly expirationDays: number;
  private readonly jobDomain: string;
  public constructor(
    @inject(SERVICES.LOGGER) protected readonly logger: Logger,
    @inject(SERVICES.TRACER) public readonly tracer: Tracer
  ) {
    super(
      logger,
      config.get<string>('externalClientsConfig.clientsUrls.jobManager.url'),
      config.get<IHttpRetryConfig>('externalClientsConfig.httpRetry'),
      'jobManagerClient',
      config.get<boolean>('externalClientsConfig.disableHttpClientLogs')
    );
    this.expirationDays = config.get<number>('cleanupExpirationDays');
    this.tilesJobType = config.get<string>('jobDefinitions.jobs.export.type');
    this.tilesTaskType = config.get<string>('jobDefinitions.tasks.init.type');
    this.jobDomain = config.get<string>('domain');
  }

  @withSpanAsyncV4
  public async getJobByJobId(jobId: string): Promise<GetJobResponse> {
    const job = await this.get<GetJobResponse>(`/jobs/${jobId}`);
    return job;
  }

  public async findExportJob(
    status: OperationStatus,
    jobParams: JobExportDuplicationParams,
    shouldReturnTasks = false
  ): Promise<JobExportResponse | undefined> {
    const queryParams: IFindJobsRequest = {
      resourceId: jobParams.resourceId,
      version: jobParams.version,
      isCleaned: false,
      type: this.tilesJobType,
      shouldReturnTasks,
      status,
    };
    const jobs = await this.getExportJobs(queryParams);
    if (jobs) {
      const matchingJob = this.findExportJobWithMatchingParams(jobs, jobParams);
      return matchingJob;
    }

    return undefined;
  }

  public async getInProgressJobs(shouldReturnTasks = false): Promise<JobExportResponse[] | undefined> {
    const queryParams: IFindJobsRequest = {
      isCleaned: false,
      type: this.tilesJobType,
      shouldReturnTasks,
      status: OperationStatus.IN_PROGRESS,
    };
    const jobs = await this.getExportJobs(queryParams);
    return jobs;
  }

  @withSpanAsyncV4
  public async getExportJobs(queryParams: IFindJobsRequest): Promise<JobExportResponse[] | undefined> {
    this.logger.debug({ ...queryParams }, `Getting jobs that match these parameters`);
    const jobs = await this.get<JobExportResponse[] | undefined>('/jobs', queryParams as unknown as Record<string, unknown>);
    return jobs;
  }

  //TODO: check how export cleanup works and which params it needs
  public async validateAndUpdateExpiration(jobId: string): Promise<void> {
    const getOrUpdateURL = `/jobs/${jobId}`;
    const newExpirationDate = getUTCDate();
    newExpirationDate.setDate(newExpirationDate.getDate() + this.expirationDays);
    const job = await this.get<JobExportResponse>(getOrUpdateURL);
    const oldExpirationDate = new Date(job.parameters.cleanupDataParams?.cleanupExpirationTimeUTC as Date);
    if (oldExpirationDate < newExpirationDate) {
      this.logger.info({ jobId, oldExpirationDate, newExpirationDate, msg: 'update expirationDate' });
      await this.put(getOrUpdateURL, {
        parameters: {
          ...job.parameters,
          cleanupDataParams: {
            ...job.parameters.cleanupDataParams,
            cleanupExpirationTimeUTC: newExpirationDate,
            directoryPath: job.parameters.cleanupDataParams?.directoryPath,
          },
        },
      });
    } else {
      const msg = 'Wont update expiration date, as current expiration date is later than current expiration date';
      this.logger.info({ jobId, oldExpirationDate, newExpirationDate, msg });
    }
  }

  @withSpanAsyncV4
  public async createExportJob(data: IExportInitRequest): Promise<ICreateExportJobResponse> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + this.expirationDays);
    const taskParams: ITaskParameters[] = [{ blockDuplication: true }];

    const jobParameters: ExportJobParameters = {
      exportInputParams: {
        roi: data.roi,
        callbacks: data.callbacks,
        crs:
          data.crs === 'EPSG:4326'
            ? data.crs
            : (() => {
                throw new Error('Invalid CRS');
              })(),
      },
      additionalParams: {
        fileNamesTemplates: data.fileNamesTemplates,
        relativeDirectoryPath: data.relativeDirectoryPath,
        packageRelativePath: data.packageRelativePath,
      },
    };

    const createJobRequest: CreateExportJobBody = {
      resourceId: data.cswProductId,
      version: data.version,
      type: this.tilesJobType,
      domain: this.jobDomain,
      parameters: jobParameters,
      internalId: data.dbId,
      productType: data.productType,
      productName: data.cswProductId,
      priority: data.priority,
      description: data.description,
      status: OperationStatus.PENDING,
      percentage: 0,
      additionalIdentifiers: data.relativeDirectoryPath,
      tasks: taskParams.map((params) => {
        return {
          type: this.tilesTaskType,
          parameters: params,
        };
      }),
    };
    const res = await this.createJob<ExportJobParameters, ITaskParameters>(createJobRequest);
    const createJobResponse: ICreateExportJobResponse = {
      jobId: res.id,
      taskIds: res.taskIds,
      status: OperationStatus.PENDING,
    };
    return createJobResponse;
  }

  private findExportJobWithMatchingParams(jobs: JobExportResponse[], jobParams: JobExportDuplicationParams): JobExportResponse | undefined {
    const matchingJob = jobs.find(
      (job) =>
        job.internalId === jobParams.dbId &&
        job.version === jobParams.version &&
        job.parameters.exportInputParams.crs === jobParams.crs &&
        checkFeatures(job.parameters.exportInputParams.roi, jobParams.roi)
    );
    return matchingJob;
  }
}
