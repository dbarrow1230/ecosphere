// /backend/business/returnBusiness.js

import {Order,OrderItem,Product,Purchase,PurchaseItem,Return,ReturnItem,Store,Unit} from '../models/index.js';
import {calculateReturnItemRefund,calculateReturnTotals} from './totalsBusiness.js';
import {applyInventoryFromReturnLogic} from './inventoryBusiness.js';
import {reverseRefundFromBudgetLogic} from './budgetBusiness.js';
import {requireStatusByTypeAndKey,validateStatusRef} from './statusBusiness.js';

const ensureExists=async(Model,id,message)=>{
 const doc=await Model.findById(id);
 if(!doc) throw new Error(message);
 return doc;
};

export const recalculateReturnLogic=async(returnId)=>{
 const returnDoc=await Return.findById(returnId);
 if(!returnDoc) throw new Error('Return not found');
 const items=await ReturnItem.find({return:returnId}).populate('status');
 const totals=calculateReturnTotals(items);
 returnDoc.refundTotal=totals.refundTotal;
 await returnDoc.save();
 return returnDoc;
};

export const createReturnLogic=async(data={},items=[])=>{
 if(!data.user) throw new Error('User is required');
 if(data.store) await ensureExists(Store,data.store,'Invalid store');
 if(data.order) await ensureExists(Order,data.order,'Invalid order');
 if(data.purchase) await ensureExists(Purchase,data.purchase,'Invalid purchase');
 if(data.status) await validateStatusRef({statusId:data.status,type:'returnStatus'});
 else data.status=(await requireStatusByTypeAndKey('returnStatus','requested'))._id;
 if(data.refundStatus) await validateStatusRef({statusId:data.refundStatus,type:'refundStatus'});
 else data.refundStatus=(await requireStatusByTypeAndKey('refundStatus','pending'))._id;
 const returnDoc=await Return.create(data);
 if(Array.isArray(items)&&items.length){
  for(const item of items){
   await addItemToReturnLogic(returnDoc._id,item);
  }
 }
 return await recalculateReturnLogic(returnDoc._id);
};

export const addItemToReturnLogic=async(returnId,data={})=>{
 const returnDoc=await ensureExists(Return,returnId,'Return not found');
 await ensureExists(Product,data.product,'Invalid product');
 if(data.unit) await ensureExists(Unit,data.unit,'Invalid unit');
 let eligibleQuantity=0;
 if(data.purchaseItem){
  const purchaseItem=await ensureExists(PurchaseItem,data.purchaseItem,'Invalid purchase item');
  eligibleQuantity=Number(purchaseItem.quantity)||0;
 }
 if(data.orderItem){
  const orderItem=await ensureExists(OrderItem,data.orderItem,'Invalid order item');
  eligibleQuantity=Math.max(eligibleQuantity,Number(orderItem.quantityDelivered)||Number(orderItem.quantityOrdered)||0);
 }
 const quantity=Number(data.quantity)||0;
 if(quantity<=0) throw new Error('Quantity must be greater than 0');
 if(eligibleQuantity>0&&quantity>eligibleQuantity) throw new Error('Return quantity exceeds eligible quantity');
 if(data.status) await validateStatusRef({statusId:data.status,type:'returnItemStatus'});
 else data.status=(await requireStatusByTypeAndKey('returnItemStatus','requested'))._id;
 const payload={...data,return:returnDoc._id};
 payload.refundAmount=calculateReturnItemRefund(payload);
 const item=await ReturnItem.create(payload);
 await recalculateReturnLogic(returnDoc._id);
 return item;
};

export const completeReturnLogic=async(returnId)=>{
 const returnDoc=await Return.findById(returnId);
 if(!returnDoc) throw new Error('Return not found');
 const items=await ReturnItem.find({return:returnId});
 const completedStatus=await requireStatusByTypeAndKey('returnItemStatus','completed');
 for(const item of items){
  item.status=completedStatus._id;
  await item.save();
  if(item.orderItem){
   const orderItem=await OrderItem.findById(item.orderItem);
   if(orderItem){
    orderItem.quantityReturned=(Number(orderItem.quantityReturned)||0)+(Number(item.quantity)||0);
    await orderItem.save();
   }
  }
  if(item.purchaseItem){
   const purchaseItem=await PurchaseItem.findById(item.purchaseItem);
   if(purchaseItem){
    purchaseItem.refundAmount=(Number(purchaseItem.refundAmount)||0)+(Number(item.refundAmount)||0);
    await purchaseItem.save();
   }
  }
 }
 const status=await requireStatusByTypeAndKey('returnStatus','completed');
 const refundStatus=await requireStatusByTypeAndKey('refundStatus','refunded');
 returnDoc.status=status._id;
 returnDoc.refundStatus=refundStatus._id;
 returnDoc.completedAt=new Date();
 await recalculateReturnLogic(returnId);
 await returnDoc.save();
 await applyInventoryFromReturnLogic({user:returnDoc.user,returnItems:items});
 if(returnDoc.purchase) await reverseRefundFromBudgetLogic(returnDoc.purchase,returnDoc.refundTotal||0);
 return returnDoc;
};

export default{
 recalculateReturnLogic,
 createReturnLogic,
 addItemToReturnLogic,
 completeReturnLogic
};