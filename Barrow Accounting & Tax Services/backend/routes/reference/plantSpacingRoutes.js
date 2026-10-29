//backend/routes/reference/plantSpacingRoutes.js
import express from 'express';
import { getPlantSpacings, getPlantSpacingById, createPlantSpacing, updatePlantSpacing, deletePlantSpacing } from '../../controllers/reference/plantSpacingController.js';

const router = express.Router();

router.route('/').get(getPlantSpacings).post(createPlantSpacing);
router.route('/:id').get(getPlantSpacingById).put(updatePlantSpacing).delete(deletePlantSpacing);

export default router;