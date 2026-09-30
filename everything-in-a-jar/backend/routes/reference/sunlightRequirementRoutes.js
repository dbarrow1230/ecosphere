//backend/routes/reference/sunlightRequirementRoutes.js
import express from 'express';
import { getSunlightRequirements, getSunlightRequirementById, createSunlightRequirement, updateSunlightRequirement, deleteSunlightRequirement } from '../../controllers/reference/sunlightRequirementController.js';

const router = express.Router();

router.route('/').get(getSunlightRequirements).post(createSunlightRequirement);
router.route('/:id').get(getSunlightRequirementById).put(updateSunlightRequirement).delete(deleteSunlightRequirement);

export default router;