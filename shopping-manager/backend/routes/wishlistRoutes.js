// /backend/routes/wishlistRoutes.js
import express from 'express';
import{createWishlist,getWishlists,getWishlistById,getWishlistsByUser,updateWishlist,deleteWishlist}from '../controllers/wishlistController.js';

const router=express.Router();

router.post('/',createWishlist);
router.get('/',getWishlists);
router.get('/user/:userId',getWishlistsByUser);
router.get('/:id',getWishlistById);
router.put('/:id',updateWishlist);
router.delete('/:id',deleteWishlist);

export default router;