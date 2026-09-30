//backend/routes/reference/plantSoilTempRoutes.js
import express from 'express';
import { getPlantSoilTemps, getPlantSoilTempById, createPlantSoilTemp, updatePlantSoilTemp, deletePlantSoilTemp } from '../../controllers/reference/plantSoilTempController.js';

const router = express.Router();

router.route('/').get(getPlantSoilTemps).post(createPlantSoilTemp);
router.route('/:id').get(getPlantSoilTempById).put(updatePlantSoilTemp).delete(deletePlantSoilTemp);

export default router;