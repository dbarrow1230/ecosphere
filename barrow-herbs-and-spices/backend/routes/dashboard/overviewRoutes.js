import { Router } from 'express';
export function createOverviewRoutes(controller) {
  const router = Router();
  router.get('/', controller.getOverview);
  return router;
}
