//backend/routes/growth/growthRateRoutes.js
import express from 'express';
import { getGrowthRates, getGrowthRateById, createGrowthRate, updateGrowthRate, deleteGrowthRate } from '../../controllers/growth/growthRateController.js';

const router = express.Router();

router.route('/').get(getGrowthRates).post(createGrowthRate);
router.route('/:id').get(getGrowthRateById).put(updateGrowthRate).delete(deleteGrowthRate);

export default router;