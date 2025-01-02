import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { ExportStatusHandlerController } from '../../tasks/controllers/tasksController';

const exportStatusRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(ExportStatusHandlerController);

  router.get('/taskStatus/:jobId', controller.getStatusByJobId);

  return router;
};

export const EXPORT_STATUS_ROUTER_SYMBOL = Symbol('tasksFactory');

export { exportStatusRouterFactory };
