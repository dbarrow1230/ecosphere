// /backend/routes/categoryRoutes.js
import express from 'express';
import{createCategory,getCategories,getActiveCategories,getParentCategories,getCategoryById,getCategoryBySlug,updateCategory,deleteCategory}from '../controllers/categoryController.js';

const router=express.Router();

router.post('/',createCategory);
router.get('/',getCategories);
router.get('/active',getActiveCategories);
router.get('/parents',getParentCategories);
router.get('/slug/:slug',getCategoryBySlug);
router.get('/:id',getCategoryById);
router.put('/:id',updateCategory);
router.delete('/:id',deleteCategory);

export default router;