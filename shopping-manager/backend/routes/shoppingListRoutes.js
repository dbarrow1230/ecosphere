// /backend/routes/shoppingListRoutes.js
import express from 'express';
import{createShoppingList,getShoppingLists,getFavoriteShoppingLists,getShoppingListById,getShoppingListsByUser,updateShoppingList,deleteShoppingList}from '../controllers/shoppingListController.js';

const router=express.Router();

router.post('/',createShoppingList);
router.get('/',getShoppingLists);
router.get('/favorites',getFavoriteShoppingLists);
router.get('/user/:userId',getShoppingListsByUser);
router.get('/:id',getShoppingListById);
router.put('/:id',updateShoppingList);
router.delete('/:id',deleteShoppingList);

export default router;