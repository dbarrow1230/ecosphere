// /backend/routes/returnRoutes.js
import express from 'express';
import{createReturn,getReturns,getReturnById,getReturnsByUser,getReturnByNumber,updateReturn,deleteReturn}from '../controllers/returnController.js';

const router=express.Router();

router.post('/',createReturn);
router.get('/',getReturns);
router.get('/user/:userId',getReturnsByUser);
router.get('/number/:returnNumber',getReturnByNumber);
router.get('/:id',getReturnById);
router.put('/:id',updateReturn);
router.delete('/:id',deleteReturn);

export default router;