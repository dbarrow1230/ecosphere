import express from 'express';
import { getPlantingDepths, getPlantingDepthById, createPlantingDepth, updatePlantingDepth, deletePlantingDepth } from '../../controllers/growth/plantingDepthController.js';

const router = express.Router();

router.route('/').get(getPlantingDepths).post(createPlantingDepth);
router.route('/:id').get(getPlantingDepthById).put(updatePlantingDepth).delete(deletePlantingDepth);

export default router;