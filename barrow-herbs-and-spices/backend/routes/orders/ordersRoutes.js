import { Router } from 'express';
export function createOrdersRoutes(controller) {
  const router = Router();
  router.patch('/:id', controller.updateOrder);
  return router;
}
