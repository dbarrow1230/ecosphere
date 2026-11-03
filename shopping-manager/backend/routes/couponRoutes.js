// /backend/routes/couponRoutes.js
import express from 'express';
import{createCoupon,getCoupons,getActiveCoupons,getCouponById,getCouponsByUser,updateCoupon,deleteCoupon}from '../controllers/couponController.js';

const router=express.Router();

router.post('/',createCoupon);
router.get('/',getCoupons);
router.get('/active',getActiveCoupons);
router.get('/user/:userId',getCouponsByUser);
router.get('/:id',getCouponById);
router.put('/:id',updateCoupon);
router.delete('/:id',deleteCoupon);

export default router;