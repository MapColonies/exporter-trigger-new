import { Application } from 'express';
import supertest from 'supertest';

export class TasksSender {
  public constructor(private readonly app: Application) {}

  public async getStatusByJobId(jobId: string): Promise<supertest.Response> {
    return supertest.agent(this.app).get(`/tasks/taskStatus/${jobId}`).set('Content-Type', 'application/json').send();
  }
}
