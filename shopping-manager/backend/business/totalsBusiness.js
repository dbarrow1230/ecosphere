// /backend/business/totalsBusiness.js

const toNumber=(value)=>{
 const num=Number(value);
 return Number.isFinite(num)?num:0;
};

const roundMoney=(value)=>Math.round((toNumber(value)+Number.EPSILON)*100)/100;

export const calculateDiscountAmount=({discountType='',discountValue=0,baseAmount=0,maxDiscountAmount=0}={})=>{
 const base=toNumber(baseAmount);
 const value=toNumber(discountValue);
 const max=toNumber(maxDiscountAmount);
 let discount=0;
 if(discountType==='percent') discount=base*(value/100);
 else if(discountType==='fixed') discount=value;
 else if(discountType==='shipping') discount=value;
 if(max>0&&discount>max) discount=max;
 if(discount<0) discount=0;
 if(discount>base&&discountType!=='shipping') discount=base;
 return roundMoney(discount);
};

export const calculateTaxAmount=({taxRate=0,taxableAmount=0}={})=>{
 const rate=toNumber(taxRate);
 const amount=toNumber(taxableAmount);
 return roundMoney(amount*(rate/100));
};

export const calculateOrderItemSubtotal=(item={})=>{
 const quantity=toNumber(item.quantityOrdered??item.quantity??1);
 const unitPrice=toNumber(item.unitPrice);
 const discountAmount=toNumber(item.discountAmount);
 const taxAmount=toNumber(item.taxAmount);
 const lineBase=roundMoney(quantity*unitPrice);
 const subtotal=roundMoney(lineBase-discountAmount+taxAmount);
 return subtotal<0?0:subtotal;
};

export const calculatePurchaseItemSubtotal=(item={})=>{
 const quantity=toNumber(item.quantity);
 const unitPrice=toNumber(item.unitPrice);
 const discountAmount=toNumber(item.discountAmount);
 const taxAmount=toNumber(item.taxAmount);
 const lineBase=roundMoney(quantity*unitPrice);
 const subtotal=roundMoney(lineBase-discountAmount+taxAmount);
 return subtotal<0?0:subtotal;
};

export const calculateReturnItemRefund=(item={})=>{
 const quantity=toNumber(item.quantity);
 const unitPrice=toNumber(item.unitPrice);
 const refundAmount=toNumber(item.refundAmount);
 if(refundAmount>0) return roundMoney(refundAmount);
 return roundMoney(quantity*unitPrice);
};

export const calculateOrderTotals=(items=[],options={})=>{
 const shippingTotal=toNumber(options.shippingTotal);
 const extraDiscount=toNumber(options.discountTotal);
 let subtotal=0;
 let itemDiscountTotal=0;
 let taxTotal=0;
 for(const item of items){
  const quantity=toNumber(item.quantityOrdered??item.quantity??1);
  const unitPrice=toNumber(item.unitPrice);
  const discountAmount=toNumber(item.discountAmount);
  const taxAmount=toNumber(item.taxAmount);
  subtotal+=roundMoney(quantity*unitPrice);
  itemDiscountTotal+=discountAmount;
  taxTotal+=taxAmount;
 }
 subtotal=roundMoney(subtotal);
 itemDiscountTotal=roundMoney(itemDiscountTotal);
 taxTotal=roundMoney(taxTotal);
 const discountTotal=roundMoney(itemDiscountTotal+extraDiscount);
 const total=roundMoney(subtotal-discountTotal+taxTotal+shippingTotal);
 return{
  subtotal,
  discountTotal,
  taxTotal,
  shippingTotal:roundMoney(shippingTotal),
  total:total<0?0:total
 };
};

export const calculatePurchaseTotals=(items=[],options={})=>{
 const shippingTotal=toNumber(options.shippingTotal);
 const extraDiscount=toNumber(options.discountTotal);
 let subtotal=0;
 let itemDiscountTotal=0;
 let taxTotal=0;
 for(const item of items){
  const quantity=toNumber(item.quantity);
  const unitPrice=toNumber(item.unitPrice);
  const discountAmount=toNumber(item.discountAmount);
  const taxAmount=toNumber(item.taxAmount);
  subtotal+=roundMoney(quantity*unitPrice);
  itemDiscountTotal+=discountAmount;
  taxTotal+=taxAmount;
 }
 subtotal=roundMoney(subtotal);
 itemDiscountTotal=roundMoney(itemDiscountTotal);
 taxTotal=roundMoney(taxTotal);
 const discountTotal=roundMoney(itemDiscountTotal+extraDiscount);
 const total=roundMoney(subtotal-discountTotal+taxTotal+shippingTotal);
 return{
  subtotal,
  discountTotal,
  taxTotal,
  shippingTotal:roundMoney(shippingTotal),
  total:total<0?0:total
 };
};

export const calculateReturnTotals=(items=[])=>{
 let refundTotal=0;
 for(const item of items){
  refundTotal+=calculateReturnItemRefund(item);
 }
 refundTotal=roundMoney(refundTotal);
 return{refundTotal};
};

export const calculateShoppingListEstimatedTotal=(items=[])=>{
 let estimatedTotal=0;
 for(const item of items){
  const quantity=toNumber(item.quantity);
  const estimatedPrice=toNumber(item.estimatedPrice);
  estimatedTotal+=roundMoney(quantity*estimatedPrice);
 }
 return roundMoney(estimatedTotal);
};

export const getQuantityDelta=({previousQuantity=0,nextQuantity=0}={})=>{
 return roundMoney(toNumber(nextQuantity)-toNumber(previousQuantity));
};

export default{
 roundMoney,
 calculateDiscountAmount,
 calculateTaxAmount,
 calculateOrderItemSubtotal,
 calculatePurchaseItemSubtotal,
 calculateReturnItemRefund,
 calculateOrderTotals,
 calculatePurchaseTotals,
 calculateReturnTotals,
 calculateShoppingListEstimatedTotal,
 getQuantityDelta
};