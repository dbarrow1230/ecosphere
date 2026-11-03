import { Router } from 'express';
export function createProductionRoutes(controller) {
  const router = Router();
  router.post('/', controller.recordProduction);
  return router;
}
