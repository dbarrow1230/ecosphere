import { Router } from 'express';
import rateLimit from 'express-rate-limit';
export function createPublicWebsiteRoutes(controller) {
  const router = Router();
  const limit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  });
  router.get('/products', controller.getProducts);
  router.post('/orders', limit, controller.createOrder);
  return router;
}
