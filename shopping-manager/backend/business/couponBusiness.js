// /backend/business/couponBusiness.js

import {Coupon,Country,Store} from '../models/index.js';
import {calculateDiscountAmount} from './totalsBusiness.js';

export const validateCouponLogic=async({couponId,storeId=null,countryId=null,baseAmount=0,atDate=new Date()}={})=>{
 const coupon=await Coupon.findById(couponId).populate('store countries');
 if(!coupon) throw new Error('Coupon not found');
 if(coupon.isActive===false) throw new Error('Coupon is inactive');
 if(coupon.startDate&&new Date(atDate)<new Date(coupon.startDate)) throw new Error('Coupon not active yet');
 if(coupon.endDate&&new Date(atDate)>new Date(coupon.endDate)) throw new Error('Coupon expired');
 if(coupon.store&&storeId&&String(coupon.store._id)!==String(storeId)) throw new Error('Coupon does not apply to this store');
 if(coupon.minPurchaseAmount&&(Number(baseAmount)||0)<(Number(coupon.minPurchaseAmount)||0)) throw new Error('Minimum purchase amount not met');
 if(countryId&&Array.isArray(coupon.countries)&&coupon.countries.length){
  const allowed=coupon.countries.some((country)=>String(country._id)===String(countryId));
  if(!allowed) throw new Error('Coupon not valid for this country');
 }
 return coupon;
};

export const getCouponDiscountLogic=async({couponId,storeId=null,countryId=null,baseAmount=0}={})=>{
 const coupon=await validateCouponLogic({couponId,storeId,countryId,baseAmount});
 const discount=calculateDiscountAmount({
  discountType:coupon.discountType,
  discountValue:coupon.discountValue,
  baseAmount,
  maxDiscountAmount:coupon.maxDiscountAmount
 });
 return{coupon,discount};
};

export const createCouponLogic=async(data={})=>{
 if(data.store) {
  const store=await Store.findById(data.store);
  if(!store) throw new Error('Invalid store');
 }
 if(Array.isArray(data.countries)&&data.countries.length){
  const count=await Country.countDocuments({_id:{$in:data.countries}});
  if(count!==data.countries.length) throw new Error('Invalid country reference');
 }
 return await Coupon.create(data);
};

export default{
 validateCouponLogic,
 getCouponDiscountLogic,
 createCouponLogic
};