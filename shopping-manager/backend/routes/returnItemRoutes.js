// /backend/routes/returnItemRoutes.js
import express from 'express';
import{createReturnItem,getReturnItems,getReturnItemById,getReturnItemsByReturn,updateReturnItem,deleteReturnItem}from '../controllers/returnItemController.js';

const router=express.Router();

router.post('/',createReturnItem);
router.get('/',getReturnItems);
router.get('/return/:returnId',getReturnItemsByReturn);
router.get('/:id',getReturnItemById);
router.put('/:id',updateReturnItem);
router.delete('/:id',deleteReturnItem);

export default router;