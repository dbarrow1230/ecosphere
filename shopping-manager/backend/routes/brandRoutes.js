// /backend/routes/brandRoutes.js
import express from 'express';
import{createBrand,getBrands,getActiveBrands,getBrandById,getBrandBySlug,updateBrand,deleteBrand}from '../controllers/brandController.js';

const router=express.Router();

router.post('/',createBrand);
router.get('/',getBrands);
router.get('/active',getActiveBrands);
router.get('/slug/:slug',getBrandBySlug);
router.get('/:id',getBrandById);
router.put('/:id',updateBrand);
router.delete('/:id',deleteBrand);

export default router;