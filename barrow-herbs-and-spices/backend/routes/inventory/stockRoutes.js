import { Router } from 'express';
export function createStockRoutes(controller) {
  const router = Router();
  router.post('/', controller.adjustStock);
  return router;
}
