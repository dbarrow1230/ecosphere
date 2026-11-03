// /backend/routes/budgetRoutes.js
import express from 'express';
import{createBudget,getBudgets,getActiveBudgets,getBudgetById,getBudgetsByUser,updateBudget,deleteBudget}from '../controllers/budgetController.js';

const router=express.Router();

router.post('/',createBudget);
router.get('/',getBudgets);
router.get('/active',getActiveBudgets);
router.get('/user/:userId',getBudgetsByUser);
router.get('/:id',getBudgetById);
router.put('/:id',updateBudget);
router.delete('/:id',deleteBudget);

export default router;