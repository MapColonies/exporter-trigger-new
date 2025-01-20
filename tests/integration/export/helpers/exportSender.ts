import { ICreateExportRequest } from '@src/common/interfaces';
import { Application } from 'express';
import supertest from 'supertest';

export class ExportSender {
  public constructor(private readonly app: Application) {}

  public async export(body: ICreateExportRequest): Promise<supertest.Response> {
    return supertest.agent(this.app).post(`/export`).set('Content-Type', 'application/json').send(body);
  }
}
