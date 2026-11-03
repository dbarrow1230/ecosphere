import { Router } from 'express';
export function createResourcesRoutes(controller) {
  const router = Router();
  router.get('/:kind', controller.getResources);
  router.post('/:kind', controller.createResource);
  router.put('/:kind/:id', controller.updateResource);
  router.delete('/:kind/:id', controller.archiveResource);
  return router;
}
