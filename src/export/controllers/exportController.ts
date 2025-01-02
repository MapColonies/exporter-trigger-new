import { Logger } from '@map-colonies/js-logger';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { CallbackExportResponse } from '@map-colonies/raster-shared';
import { SERVICES } from '../../common/constants';
import { ExportManager } from '../models/exportManager';
import { ICreateExportRequest, ICreateExportJobResponse } from '../../common/interfaces';

type CreateExportHandler = RequestHandler<undefined, ICreateExportJobResponse | CallbackExportResponse, ICreateExportRequest>;

@injectable()
export class ExportController {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(ExportManager) private readonly manager: ExportManager
  ) {}

  public createPackageRoi: CreateExportHandler = async (req, res, next) => {
    const userInput: ICreateExportRequest = req.body;
    try {
      this.logger.debug(userInput, `Creating package with user input`);
      const jobCreated = await this.manager.createExport(userInput);
      return res.status(httpStatus.OK).json(jobCreated);
    } catch (err) {
      next(err);
    }
  };
}
