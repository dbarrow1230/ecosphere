// /backend/routes/statusRoutes.js
import express from 'express';
import{createStatus,getStatuses,getActiveStatuses,getStatusById,getStatusesByType,getStatusByTypeAndKey,updateStatus,deleteStatus}from '../controllers/statusController.js';

const router=express.Router();

router.post('/',createStatus);
router.get('/',getStatuses);
router.get('/active',getActiveStatuses);
router.get('/type/:type',getStatusesByType);
router.get('/type/:type/key/:key',getStatusByTypeAndKey);
router.get('/:id',getStatusById);
router.put('/:id',updateStatus);
router.delete('/:id',deleteStatus);

export default router;