// /backend/routes/shoppingListItemRoutes.js
import express from 'express';
import{createShoppingListItem,getShoppingListItems,getPurchasedShoppingListItems,getShoppingListItemById,getShoppingListItemsByList,updateShoppingListItem,deleteShoppingListItem}from '../controllers/shoppingListItemController.js';

const router=express.Router();

router.post('/',createShoppingListItem);
router.get('/',getShoppingListItems);
router.get('/purchased',getPurchasedShoppingListItems);
router.get('/list/:shoppingListId',getShoppingListItemsByList);
router.get('/:id',getShoppingListItemById);
router.put('/:id',updateShoppingListItem);
router.delete('/:id',deleteShoppingListItem);

export default router;