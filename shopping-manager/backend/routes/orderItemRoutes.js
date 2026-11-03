// /backend/routes/orderItemRoutes.js
import express from 'express';
import{createOrderItem,getOrderItems,getOrderItemById,getOrderItemsByOrder,updateOrderItem,deleteOrderItem}from '../controllers/orderItemController.js';

const router=express.Router();

router.post('/',createOrderItem);
router.get('/',getOrderItems);
router.get('/order/:orderId',getOrderItemsByOrder);
router.get('/:id',getOrderItemById);
router.put('/:id',updateOrderItem);
router.delete('/:id',deleteOrderItem);

export default router;