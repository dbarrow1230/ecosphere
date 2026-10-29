import express from 'express';
import { getPropagationMethods, getPropagationMethodById, createPropagationMethod, updatePropagationMethod, deletePropagationMethod } from '../../controllers/reference/propagationMethodController.js';

const router = express.Router();

router.route('/').get(getPropagationMethods).post(createPropagationMethod);
router.route('/:id').get(getPropagationMethodById).put(updatePropagationMethod).delete(deletePropagationMethod);

export default router;