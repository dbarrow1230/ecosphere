// /backend/routes/orderRoutes.js
import express from 'express';
import{createOrder,getOrders,getOrderById,getOrdersByUser,getOrderByNumber,updateOrder,deleteOrder}from '../controllers/orderController.js';

const router=express.Router();

router.post('/',createOrder);
router.get('/',getOrders);
router.get('/user/:userId',getOrdersByUser);
router.get('/number/:orderNumber',getOrderByNumber);
router.get('/:id',getOrderById);
router.put('/:id',updateOrder);
router.delete('/:id',deleteOrder);

export default router;