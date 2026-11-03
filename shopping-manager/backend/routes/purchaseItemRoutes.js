// /backend/routes/purchaseItemRoutes.js
import express from 'express';
import{createPurchaseItem,getPurchaseItems,getPurchaseItemById,getPurchaseItemsByPurchase,updatePurchaseItem,deletePurchaseItem}from '../controllers/purchaseItemController.js';

const router=express.Router();

router.post('/',createPurchaseItem);
router.get('/',getPurchaseItems);
router.get('/purchase/:purchaseId',getPurchaseItemsByPurchase);
router.get('/:id',getPurchaseItemById);
router.put('/:id',updatePurchaseItem);
router.delete('/:id',deletePurchaseItem);

export default router;