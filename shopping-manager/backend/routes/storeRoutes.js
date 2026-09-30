// /backend/routes/storeRoutes.js
import express from 'express';
import{createStore,getStores,getActiveStores,getOnlineStores,getStoreById,getStoreBySlug,updateStore,deleteStore}from '../controllers/storeController.js';

const router=express.Router();

router.post('/',createStore);
router.get('/',getStores);
router.get('/active',getActiveStores);
router.get('/online',getOnlineStores);
router.get('/slug/:slug',getStoreBySlug);
router.get('/:id',getStoreById);
router.put('/:id',updateStore);
router.delete('/:id',deleteStore);

export default router;