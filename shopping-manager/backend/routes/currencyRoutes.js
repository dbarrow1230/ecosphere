// /backend/routes/currencyRoutes.js
import express from 'express';
import{createCurrency,getCurrencies,getActiveCurrencies,getCurrencyById,getCurrencyByCode,updateCurrency,deleteCurrency}from '../controllers/currencyController.js';

const router=express.Router();

router.post('/',createCurrency);
router.get('/',getCurrencies);
router.get('/active',getActiveCurrencies);
router.get('/code/:code',getCurrencyByCode);
router.get('/:id',getCurrencyById);
router.put('/:id',updateCurrency);
router.delete('/:id',deleteCurrency);

export default router;