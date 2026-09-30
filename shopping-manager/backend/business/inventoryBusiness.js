// /backend/business/inventoryBusiness.js

import {Inventory,Product,Purchase,PurchaseItem,Store,Unit} from '../models/index.js';
import {applyPurchaseInventoryDeltaInput,applyPurchaseInventoryIncreaseInput,applyReturnInventoryRestockInput} from './inventoryFlowBusiness.js';

const ensureExists=async(Model,id,message)=>{
 const doc=await Model.findById(id);
 if(!doc) throw new Error(message);
 return doc;
};

const findInventoryRecord=async({user,product,unit=null,store=null})=>{
 return await Inventory.findOne({
  user,
  product,
  unit:unit||null,
  store:store||null
 });
};

export const upsertInventoryQuantityLogic=async({user,product,unit=null,store=null,quantity=0,mode='increase'}={})=>{
 if(!user||!product) throw new Error('User and product are required');
 const qty=Number(quantity)||0;
 let record=await findInventoryRecord({user,product,unit,store});
 if(!record){
  record=await Inventory.create({
   user,
   product,
   unit:unit||null,
   store:store||null,
   quantity:0
  });
 }
 if(mode==='set') record.quantity=qty;
 if(mode==='increase') record.quantity=(Number(record.quantity)||0)+qty;
 if(mode==='decrease') record.quantity=(Number(record.quantity)||0)-qty;
 if(record.quantity<0) record.quantity=0;
 record.isLowStock=(Number(record.reorderLevel)||0)>0&&(Number(record.quantity)||0)<=(Number(record.reorderLevel)||0);
 await record.save();
 return record;
};

export const applyInventoryFromPurchaseCreateLogic=async(purchaseId)=>{
 const purchase=await Purchase.findById(purchaseId);
 if(!purchase) throw new Error('Purchase not found');
 const items=await PurchaseItem.find({purchase:purchaseId});
 const inputs=applyPurchaseInventoryIncreaseInput(items);
 for(const input of inputs){
  await upsertInventoryQuantityLogic({
   user:purchase.user,
   product:input.product,
   unit:input.unit,
   store:input.store,
   quantity:input.quantity,
   mode:'increase'
  });
 }
 return true;
};

export const applyInventoryFromPurchaseItemUpdateLogic=async(previousItem={},nextItem={})=>{
 const purchase=await Purchase.findById(nextItem.purchase||previousItem.purchase);
 if(!purchase) throw new Error('Purchase not found');
 const delta=applyPurchaseInventoryDeltaInput({previousItem,nextItem});
 if(!delta.product||!delta.quantity) return true;
 await upsertInventoryQuantityLogic({
  user:purchase.user,
  product:delta.product,
  unit:delta.unit,
  store:delta.store,
  quantity:Math.abs(delta.quantity),
  mode:delta.quantity>0?'increase':'decrease'
 });
 return true;
};

export const applyInventoryFromReturnLogic=async({user,returnItems=[]}={})=>{
 const inputs=applyReturnInventoryRestockInput(returnItems);
 for(const input of inputs){
  await upsertInventoryQuantityLogic({
   user,
   product:input.product,
   unit:input.unit,
   quantity:input.quantity,
   mode:'increase'
  });
 }
 return true;
};

export default{
 upsertInventoryQuantityLogic,
 applyInventoryFromPurchaseCreateLogic,
 applyInventoryFromPurchaseItemUpdateLogic,
 applyInventoryFromReturnLogic
};