// /backend/routes/unitRoutes.js
import express from 'express';
import{createUnit,getUnits,getActiveUnits,getUnitById,updateUnit,deleteUnit}from '../controllers/unitController.js';

const router=express.Router();

router.post('/',createUnit);
router.get('/',getUnits);
router.get('/active',getActiveUnits);
router.get('/:id',getUnitById);
router.put('/:id',updateUnit);
router.delete('/:id',deleteUnit);

export default router;