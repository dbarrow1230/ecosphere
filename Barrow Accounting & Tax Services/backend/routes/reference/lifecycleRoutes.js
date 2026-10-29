//backend/routes/reference/lifecycleRoutes.js
import express from 'express';
import { getLifecycles, getLifecycleById, createLifecycle, updateLifecycle, deleteLifecycle } from '../../controllers/reference/lifecycleController.js';

const router = express.Router();

router.route('/').get(getLifecycles).post(createLifecycle);
router.route('/:id').get(getLifecycleById).put(updateLifecycle).delete(deleteLifecycle);

export default router;