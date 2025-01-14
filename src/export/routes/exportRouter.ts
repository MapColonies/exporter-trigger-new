import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { ExportController } from '../controllers/exportController';

const exportRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(ExportController);

  router.post('/', controller.createPackageRoi);

  return router;
};

export const CREATE_PACKAGE_ROUTER_SYMBOL = Symbol('createPackageFactory');

export { exportRouterFactory as createPackageRouterFactory };
