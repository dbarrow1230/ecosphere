//backend/routes/reference/wateringRequirementRoutes.js
import express from 'express';
import { getWateringRequirements, getWateringRequirementById, createWateringRequirement, updateWateringRequirement, deleteWateringRequirement } from '../../controllers/reference/wateringRequirementController.js';

const router = express.Router();

router.route('/').get(getWateringRequirements).post(createWateringRequirement);
router.route('/:id').get(getWateringRequirementById).put(updateWateringRequirement).delete(deleteWateringRequirement);

export default router;