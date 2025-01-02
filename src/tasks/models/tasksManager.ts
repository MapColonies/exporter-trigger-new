import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { withSpanAsyncV4 } from '@map-colonies/telemetry';
import { Tracer } from '@opentelemetry/api';
import { IJobStatusResponse } from '@src/common/interfaces';
import { SERVICES } from '../../common/constants';
import { JobManagerWrapper } from '../../clients/jobManagerWrapper';

@injectable()
export class ExportStatusHandler {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(SERVICES.TRACER) public readonly tracer: Tracer,
    @inject(JobManagerWrapper) private readonly jobManagerClient: JobManagerWrapper
  ) {}

  @withSpanAsyncV4
  public async getJobStatusByJobId(jobId: string): Promise<IJobStatusResponse> {
    const job = await this.jobManagerClient.getJobByJobId(jobId);

    const statusResponse: IJobStatusResponse = {
      percentage: job.percentage,
      status: job.status,
    };
    this.logger.debug({ msg: `retrieved job: ${jobId},with percentage: ${job.percentage} and status: ${job.status}` });
    return statusResponse;
  }
}
