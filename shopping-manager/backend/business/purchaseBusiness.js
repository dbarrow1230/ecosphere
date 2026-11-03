// /backend/business/purchaseBusiness.js

import {Coupon,Order,OrderItem,Product,Purchase,PurchaseItem,Receipt,Store,Unit} from '../models/index.js';
import {calculatePurchaseItemSubtotal,calculatePurchaseTotals,getQuantityDelta} from './totalsBusiness.js';
import {getCouponDiscountLogic} from './couponBusiness.js';
import {applyPurchaseToBudgetLogic,reverseRefundFromBudgetLogic} from './budgetBusiness.js';
import {applyInventoryFromPurchaseCreateLogic,applyInventoryFromPurchaseItemUpdateLogic} from './inventoryBusiness.js';
import {requireStatusByTypeAndKey,validateStatusRef} from './statusBusiness.js';

const ensureExists=async(Model,id,message)=>{
 const doc=await Model.findById(id);
 if(!doc) throw new Error(message);
 return doc;
};

export const recalculatePurchaseLogic=async(purchaseId)=>{
 const purchase=await Purchase.findById(purchaseId).populate('coupon');
 if(!purchase) throw new Error('Purchase not found');
 const items=await PurchaseItem.find({purchase:purchaseId});
 const baseTotals=calculatePurchaseTotals(items,{shippingTotal:purchase.shippingTotal||0,discountTotal:0});
 let couponDiscount=0;
 if(purchase.coupon){
  const couponResult=await getCouponDiscountLogic({
   couponId:purchase.coupon._id,
   storeId:purchase.store||null,
   baseAmount:baseTotals.subtotal
  });
  couponDiscount=couponResult.discount;
 }
 const totals=calculatePurchaseTotals(items,{shippingTotal:purchase.shippingTotal||0,discountTotal:couponDiscount});
 purchase.subtotal=totals.subtotal;
 purchase.discountTotal=totals.discountTotal;
 purchase.taxTotal=totals.taxTotal;
 purchase.total=totals.total;
 await purchase.save();
 return purchase;
};

export const createPurchaseLogic=async(data={},items=[])=>{
 if(!data.user) throw new Error('User is required');
 if(data.store) await ensureExists(Store,data.store,'Invalid store');
 if(data.receipt) await ensureExists(Receipt,data.receipt,'Invalid receipt');
 if(data.coupon) await ensureExists(Coupon,data.coupon,'Invalid coupon');
 if(data.status) await validateStatusRef({statusId:data.status,type:'purchaseStatus'});
 else data.status=(await requireStatusByTypeAndKey('purchaseStatus','paid'))._id;
 const purchase=await Purchase.create(data);
 if(Array.isArray(items)&&items.length){
  for(const item of items){
   await addItemToPurchaseLogic(purchase._id,item,false);
  }
 }
 await recalculatePurchaseLogic(purchase._id);
 await applyInventoryFromPurchaseCreateLogic(purchase._id);
 await applyPurchaseToBudgetLogic(purchase._id);
 return await Purchase.findById(purchase._id);
};

export const createPurchaseFromOrderLogic=async(orderId,data={})=>{
 const order=await Order.findById(orderId);
 if(!order) throw new Error('Order not found');
 const orderItems=await OrderItem.find({order:orderId});
 const purchase=await createPurchaseLogic({
  user:data.user||order.user,
  store:data.store||order.store||null,
  receipt:data.receipt||order.receipt||null,
  coupon:data.coupon||order.coupon||null,
  shoppingList:data.shoppingList||order.shoppingList||null,
  paymentMethod:data.paymentMethod||order.paymentMethod||''
 });
 for(const orderItem of orderItems){
  await addItemToPurchaseLogic(purchase._id,{
   product:orderItem.product,
   shoppingListItem:orderItem.shoppingListItem||null,
   unit:orderItem.unit||null,
   quantity:orderItem.quantityDelivered||orderItem.quantityOrdered||1,
   unitPrice:orderItem.unitPrice||0,
   discountAmount:orderItem.discountAmount||0,
   taxAmount:orderItem.taxAmount||0,
   subtotal:orderItem.subtotal||0
  },false);
 }
 await recalculatePurchaseLogic(purchase._id);
 await applyInventoryFromPurchaseCreateLogic(purchase._id);
 await applyPurchaseToBudgetLogic(purchase._id);
 return await Purchase.findById(purchase._id);
};

export const addItemToPurchaseLogic=async(purchaseId,data={},syncInventory=true)=>{
 const purchase=await ensureExists(Purchase,purchaseId,'Purchase not found');
 await ensureExists(Product,data.product,'Invalid product');
 if(data.unit) await ensureExists(Unit,data.unit,'Invalid unit');
 const quantity=Number(data.quantity)||0;
 if(quantity<=0) throw new Error('Quantity must be greater than 0');
 const payload={...data,purchase:purchase._id};
 payload.subtotal=calculatePurchaseItemSubtotal(payload);
 const item=await PurchaseItem.create(payload);
 await recalculatePurchaseLogic(purchase._id);
 if(syncInventory) await applyInventoryFromPurchaseCreateLogic(purchase._id);
 return item;
};

export const updatePurchaseItemLogic=async(purchaseItemId,data={})=>{
 const item=await PurchaseItem.findById(purchaseItemId);
 if(!item) throw new Error('Purchase item not found');
 const previousItem=item.toObject();
 if(data.product) await ensureExists(Product,data.product,'Invalid product');
 if(data.unit) await ensureExists(Unit,data.unit,'Invalid unit');
 Object.assign(item,data);
 if((Number(item.quantity)||0)<=0) throw new Error('Quantity must be greater than 0');
 item.subtotal=calculatePurchaseItemSubtotal(item);
 await item.save();
 await recalculatePurchaseLogic(item.purchase);
 await applyInventoryFromPurchaseItemUpdateLogic(previousItem,item.toObject());
 await applyPurchaseToBudgetLogic(item.purchase);
 return item;
};

export const markPurchaseRefundedLogic=async(purchaseId,refundTotal)=>{
 const purchase=await Purchase.findById(purchaseId);
 if(!purchase) throw new Error('Purchase not found');
 const targetKey=(Number(refundTotal)||0)>=(Number(purchase.total)||0)?'refunded':'partiallyRefunded';
 const status=await requireStatusByTypeAndKey('purchaseStatus',targetKey);
 purchase.status=status._id;
 purchase.refundTotal=refundTotal;
 await purchase.save();
 await reverseRefundFromBudgetLogic(purchase._id,refundTotal);
 return purchase;
};

export default{
 recalculatePurchaseLogic,
 createPurchaseLogic,
 createPurchaseFromOrderLogic,
 addItemToPurchaseLogic,
 updatePurchaseItemLogic,
 markPurchaseRefundedLogic
};