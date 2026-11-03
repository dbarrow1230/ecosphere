// /backend/routes/inventoryRoutes.js
import express from 'express';
import{createInventory,getInventories,getLowStockInventories,getInventoryById,getInventoriesByUser,updateInventory,deleteInventory}from '../controllers/inventoryController.js';

const router=express.Router();

router.post('/',createInventory);
router.get('/',getInventories);
router.get('/low-stock',getLowStockInventories);
router.get('/user/:userId',getInventoriesByUser);
router.get('/:id',getInventoryById);
router.put('/:id',updateInventory);
router.delete('/:id',deleteInventory);

export default router;