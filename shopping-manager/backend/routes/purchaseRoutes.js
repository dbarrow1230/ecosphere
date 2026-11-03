// /backend/routes/purchaseRoutes.js
import express from 'express';
import{createPurchase,getPurchases,getPurchaseById,getPurchasesByUser,updatePurchase,deletePurchase}from '../controllers/purchaseController.js';

const router=express.Router();

router.post('/',createPurchase);
router.get('/',getPurchases);
router.get('/user/:userId',getPurchasesByUser);
router.get('/:id',getPurchaseById);
router.put('/:id',updatePurchase);
router.delete('/:id',deletePurchase);

export default router;