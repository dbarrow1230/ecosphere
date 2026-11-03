// /backend/business/statusFlowBusiness.js

const getKey=(value)=>{
 if(!value) return '';
 if(typeof value==='string') return value;
 if(typeof value==='object') return value.key||'';
 return '';
};

export const resolveShoppingListStatus=(items=[])=>{
 if(!items.length) return 'active';
 const purchasedCount=items.filter((item)=>item.isPurchased).length;
 if(purchasedCount===0) return 'active';
 if(purchasedCount===items.length) return 'completed';
 return 'inProgress';
};

export const resolveOrderStatus=(items=[])=>{
 if(!items.length) return 'pending';
 let hasProcessing=false;
 let hasShipped=false;
 let hasDelivered=false;
 let hasReturned=false;
 let allCancelled=true;
 let allDelivered=true;
 let allReturned=true;
 for(const item of items){
  const key=getKey(item.status);
  if(key!=='cancelled') allCancelled=false;
  if(!['delivered','partiallyReturned','returned','refunded','exchanged'].includes(key)) allDelivered=false;
  if(!['returned','refunded'].includes(key)) allReturned=false;
  if(['processing','confirmed','backordered'].includes(key)) hasProcessing=true;
  if(['shipped','partiallyDelivered','delivered'].includes(key)) hasShipped=true;
  if(['partiallyDelivered','delivered'].includes(key)) hasDelivered=true;
  if(['partiallyReturned','returned','refunded'].includes(key)) hasReturned=true;
 }
 if(allCancelled) return 'cancelled';
 if(allReturned) return 'returned';
 if(hasReturned) return 'partiallyReturned';
 if(allDelivered) return 'delivered';
 if(hasDelivered) return 'partiallyDelivered';
 if(hasShipped) return 'shipped';
 if(hasProcessing) return 'processing';
 return 'pending';
};

export const resolveOrderShippingStatus=(items=[])=>{
 if(!items.length) return 'pending';
 let shippedQty=0;
 let deliveredQty=0;
 let orderedQty=0;
 for(const item of items){
  orderedQty+=Number(item.quantityOrdered||0);
  shippedQty+=Number(item.quantityShipped||0);
  deliveredQty+=Number(item.quantityDelivered||0);
 }
 if(orderedQty===0) return 'pending';
 if(deliveredQty>=orderedQty) return 'delivered';
 if(deliveredQty>0) return 'partiallyDelivered';
 if(shippedQty>=orderedQty) return 'shipped';
 if(shippedQty>0) return 'partiallyShipped';
 return 'pending';
};

export const resolvePurchaseStatus=(items=[])=>{
 if(!items.length) return 'paid';
 let refundedQty=0;
 let totalQty=0;
 for(const item of items){
  totalQty+=Number(item.quantity||0);
  refundedQty+=Number(item.quantityReturned||0);
 }
 if(totalQty===0) return 'paid';
 if(refundedQty===0) return 'paid';
 if(refundedQty>=totalQty) return 'refunded';
 return 'partiallyRefunded';
};

export const resolveReturnStatus=(items=[])=>{
 if(!items.length) return 'requested';
 const keys=items.map((item)=>getKey(item.status));
 if(keys.every((key)=>key==='completed')) return 'completed';
 if(keys.every((key)=>['approved','received','completed'].includes(key))) return 'approved';
 if(keys.some((key)=>key==='received')) return 'received';
 if(keys.some((key)=>key==='approved')) return 'approved';
 if(keys.every((key)=>key==='rejected')) return 'rejected';
 return 'requested';
};

export const resolveRefundStatus=(refundTotal=0,expectedRefundTotal=0)=>{
 const refund=Number(refundTotal||0);
 const expected=Number(expectedRefundTotal||0);
 if(refund<=0) return 'none';
 if(expected>0&&refund<expected) return 'partial';
 return 'refunded';
};

export default{
 resolveShoppingListStatus,
 resolveOrderStatus,
 resolveOrderShippingStatus,
 resolvePurchaseStatus,
 resolveReturnStatus,
 resolveRefundStatus
};