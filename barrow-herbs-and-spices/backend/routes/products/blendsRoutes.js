import { Router } from 'express';
export function createBlendsRoutes(controller) {
  const router = Router();
  router.post('/', controller.createBlend);
  router.put('/:id', controller.updateBlend);
  router.delete('/:id', controller.archiveBlend);
  return router;
}
