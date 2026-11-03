// /backend/business/inventoryFlowBusiness.js

export const canRestockReturnItem=(item={})=>{
 const conditionKey=typeof item.condition==='object'?item.condition?.key:item.condition;
 const resolutionKey=typeof item.resolution==='object'?item.resolution?.key:item.resolution;
 if(['damaged','defective'].includes(conditionKey)) return false;
 if(['replacement'].includes(resolutionKey)) return false;
 return true;
};

export const applyPurchaseInventoryIncreaseInput=(purchaseItems=[])=>{
 return purchaseItems.map((item)=>({
 user:item.user,
 product:item.product,
 unit:item.unit||null,
 store:item.store||null,
 quantity:Number(item.quantity||0)
 })).filter((item)=>item.user&&item.product&&item.quantity>0);
};

export const applyPurchaseInventoryDeltaInput=({previousItem={},nextItem={}}={})=>{
 const previousQuantity=Number(previousItem.quantity||0);
 const nextQuantity=Number(nextItem.quantity||0);
 return{
  user:nextItem.user||previousItem.user,
  product:nextItem.product||previousItem.product,
  unit:nextItem.unit||previousItem.unit||null,
  store:nextItem.store||previousItem.store||null,
  quantity:nextQuantity-previousQuantity
 };
};

export const applyReturnInventoryRestockInput=(returnItems=[])=>{
 return returnItems.filter((item)=>canRestockReturnItem(item)).map((item)=>({
  user:item.user,
  product:item.product,
  unit:item.unit||null,
  store:item.store||null,
  quantity:Number(item.quantity||0)
 })).filter((item)=>item.user&&item.product&&item.quantity>0);
};

export default{
 canRestockReturnItem,
 applyPurchaseInventoryIncreaseInput,
 applyPurchaseInventoryDeltaInput,
 applyReturnInventoryRestockInput
};