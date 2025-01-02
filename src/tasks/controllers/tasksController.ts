import { Logger } from '@map-colonies/js-logger';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { IJobStatusResponse } from '@src/common/interfaces';
import { SERVICES } from '../../common/constants';
import { ExportStatusHandler } from '../models/tasksManager';

type GetStatusByJobIdHandler = RequestHandler<{ jobId: string }, IJobStatusResponse, string>;

@injectable()
export class ExportStatusHandlerController {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(ExportStatusHandler) private readonly exportStatusHandler: ExportStatusHandler
  ) {}

  public getStatusByJobId: GetStatusByJobIdHandler = async (req, res, next) => {
    const jobId: string = req.params.jobId;
    try {
      const taskStatus = await this.exportStatusHandler.getJobStatusByJobId(jobId);
      return res.status(httpStatus.OK).json(taskStatus);
    } catch (err) {
      next(err);
    }
  };
}
