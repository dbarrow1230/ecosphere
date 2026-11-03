// /backend/routes/productRoutes.js
import express from 'express';
import{createProduct,getProducts,getActiveProducts,getFeaturedProducts,getProductById,getProductBySlug,updateProduct,deleteProduct}from '../controllers/productController.js';

const router=express.Router();

router.post('/',createProduct);
router.get('/',getProducts);
router.get('/active',getActiveProducts);
router.get('/featured',getFeaturedProducts);
router.get('/slug/:slug',getProductBySlug);
router.get('/:id',getProductById);
router.put('/:id',updateProduct);
router.delete('/:id',deleteProduct);

export default router;