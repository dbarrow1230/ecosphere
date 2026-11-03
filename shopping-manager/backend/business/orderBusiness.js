// /backend/business/orderBusiness.js

import {Coupon,Order,OrderItem,Product,ShoppingList,ShoppingListItem,Store,Unit} from '../models/index.js';
import {calculateOrderItemSubtotal,calculateOrderTotals} from './totalsBusiness.js';
import {getCouponDiscountLogic} from './couponBusiness.js';
import {requireStatusByTypeAndKey,validateStatusRef} from './statusBusiness.js';
import {resolveOrderShippingStatus,resolveOrderStatus} from './statusFlowBusiness.js';

const ensureExists=async(Model,id,message)=>{
 const doc=await Model.findById(id);
 if(!doc) throw new Error(message);
 return doc;
};

export const recalculateOrderLogic=async(orderId)=>{
 const items=await OrderItem.find({order:orderId}).populate('status');
 const order=await Order.findById(orderId).populate('coupon');
 if(!order) throw new Error('Order not found');
 const baseTotals=calculateOrderTotals(items,{shippingTotal:order.shippingTotal||0,discountTotal:0});
 let couponDiscount=0;
 if(order.coupon){
  const couponResult=await getCouponDiscountLogic({
   couponId:order.coupon._id,
   storeId:order.store||null,
   baseAmount:baseTotals.subtotal
  });
  couponDiscount=couponResult.discount;
 }
 const totals=calculateOrderTotals(items,{shippingTotal:order.shippingTotal||0,discountTotal:couponDiscount});
 const nextOrderStatus=await requireStatusByTypeAndKey('orderStatus',resolveOrderStatus(items));
 const nextShippingStatus=await requireStatusByTypeAndKey('shippingStatus',resolveOrderShippingStatus(items));
 order.subtotal=totals.subtotal;
 order.discountTotal=totals.discountTotal;
 order.taxTotal=totals.taxTotal;
 order.total=totals.total;
 order.status=nextOrderStatus._id;
 order.shippingStatus=nextShippingStatus._id;
 await order.save();
 return order;
};

export const createOrderLogic=async(data={},items=[])=>{
 if(!data.user) throw new Error('User is required');
 if(data.store) await ensureExists(Store,data.store,'Invalid store');
 if(data.shoppingList) await ensureExists(ShoppingList,data.shoppingList,'Invalid shopping list');
 if(data.coupon) await ensureExists(Coupon,data.coupon,'Invalid coupon');
 if(data.status) await validateStatusRef({statusId:data.status,type:'orderStatus'});
 else data.status=(await requireStatusByTypeAndKey('orderStatus','pending'))._id;
 if(data.paymentStatus) await validateStatusRef({statusId:data.paymentStatus,type:'paymentStatus'});
 else data.paymentStatus=(await requireStatusByTypeAndKey('paymentStatus','unpaid'))._id;
 if(data.shippingStatus) await validateStatusRef({statusId:data.shippingStatus,type:'shippingStatus'});
 else data.shippingStatus=(await requireStatusByTypeAndKey('shippingStatus','pending'))._id;
 const order=await Order.create(data);
 if(Array.isArray(items)&&items.length){
  for(const item of items){
   await addItemToOrderLogic(order._id,item);
  }
 }
 return await recalculateOrderLogic(order._id);
};

export const createOrderFromShoppingListLogic=async({shoppingListId,userId,storeId=null,couponId=null,selectedItemIds=[]}={})=>{
 const list=await ShoppingList.findById(shoppingListId);
 if(!list) throw new Error('Shopping list not found');
 const itemFilter={shoppingList:shoppingListId};
 if(Array.isArray(selectedItemIds)&&selectedItemIds.length) itemFilter._id={$in:selectedItemIds};
 const listItems=await ShoppingListItem.find(itemFilter).populate('product');
 if(!listItems.length) throw new Error('No shopping list items found');
 const order=await createOrderLogic({
  user:userId||list.user,
  store:storeId||list.store||null,
  shoppingList:list._id,
  coupon:couponId||null,
  orderNumber:`ORD-${Date.now()}`
 });
 for(const listItem of listItems){
  await addItemToOrderLogic(order._id,{
   product:listItem.product._id,
   shoppingListItem:listItem._id,
   unit:listItem.unit||listItem.product.unit||null,
   store:listItem.store||storeId||list.store||null,
   quantityOrdered:listItem.quantity,
   unitPrice:listItem.estimatedPrice||listItem.product.price||0
  });
 }
 return await recalculateOrderLogic(order._id);
};

export const addItemToOrderLogic=async(orderId,data={})=>{
 const order=await ensureExists(Order,orderId,'Order not found');
 await ensureExists(Product,data.product,'Invalid product');
 if(data.unit) await ensureExists(Unit,data.unit,'Invalid unit');
 if(data.store) await ensureExists(Store,data.store,'Invalid store');
 if(data.shoppingListItem) await ensureExists(ShoppingListItem,data.shoppingListItem,'Invalid shopping list item');
 if(data.status) await validateStatusRef({statusId:data.status,type:'orderItemStatus'});
 else data.status=(await requireStatusByTypeAndKey('orderItemStatus','pending'))._id;
 const quantity=Number(data.quantityOrdered)||0;
 if(quantity<=0) throw new Error('Quantity ordered must be greater than 0');
 const payload={...data,order:order._id};
 payload.subtotal=calculateOrderItemSubtotal(payload);
 const item=await OrderItem.create(payload);
 await recalculateOrderLogic(order._id);
 return item;
};

export const updateOrderItemLogic=async(orderItemId,data={})=>{
 const item=await OrderItem.findById(orderItemId);
 if(!item) throw new Error('Order item not found');
 if(data.product) await ensureExists(Product,data.product,'Invalid product');
 if(data.unit) await ensureExists(Unit,data.unit,'Invalid unit');
 if(data.store) await ensureExists(Store,data.store,'Invalid store');
 if(data.status) await validateStatusRef({statusId:data.status,type:'orderItemStatus'});
 Object.assign(item,data);
 const ordered=Number(item.quantityOrdered)||0;
 const shipped=Number(item.quantityShipped)||0;
 const delivered=Number(item.quantityDelivered)||0;
 const returned=Number(item.quantityReturned)||0;
 if(shipped>ordered||delivered>ordered||returned>ordered) throw new Error('Invalid order quantities');
 item.subtotal=calculateOrderItemSubtotal(item);
 await item.save();
 await recalculateOrderLogic(item.order);
 return item;
};

export const markOrderShippedLogic=async(orderId,{carrier='',trackingNumber='',trackingUrl='',shippedAt=new Date()}={})=>{
 const order=await Order.findById(orderId);
 if(!order) throw new Error('Order not found');
 const items=await OrderItem.find({order:orderId});
 const shippedStatus=await requireStatusByTypeAndKey('orderItemStatus','shipped');
 for(const item of items){
  item.quantityShipped=Number(item.quantityOrdered)||0;
  item.status=shippedStatus._id;
  item.carrier=carrier||item.carrier;
  item.trackingNumber=trackingNumber||item.trackingNumber;
  item.trackingUrl=trackingUrl||item.trackingUrl;
  item.shippedAt=shippedAt;
  await item.save();
 }
 order.carrier=carrier||order.carrier;
 order.trackingNumber=trackingNumber||order.trackingNumber;
 order.trackingUrl=trackingUrl||order.trackingUrl;
 order.shippedAt=shippedAt;
 await order.save();
 return await recalculateOrderLogic(orderId);
};

export const markOrderDeliveredLogic=async(orderId,{deliveredAt=new Date()}={})=>{
 const order=await Order.findById(orderId);
 if(!order) throw new Error('Order not found');
 const items=await OrderItem.find({order:orderId});
 const deliveredStatus=await requireStatusByTypeAndKey('orderItemStatus','delivered');
 for(const item of items){
  item.quantityShipped=Number(item.quantityOrdered)||0;
  item.quantityDelivered=Number(item.quantityOrdered)||0;
  item.status=deliveredStatus._id;
  item.deliveredAt=deliveredAt;
  await item.save();
 }
 order.deliveredAt=deliveredAt;
 await order.save();
 return await recalculateOrderLogic(orderId);
};

export const cancelOrderLogic=async(orderId)=>{
 const order=await Order.findById(orderId);
 if(!order) throw new Error('Order not found');
 const orderStatus=await requireStatusByTypeAndKey('orderStatus','cancelled');
 const orderItemStatus=await requireStatusByTypeAndKey('orderItemStatus','cancelled');
 const items=await OrderItem.find({order:orderId});
 for(const item of items){
  item.status=orderItemStatus._id;
  item.quantityCancelled=Number(item.quantityOrdered)||0;
  await item.save();
 }
 order.status=orderStatus._id;
 order.cancelledAt=new Date();
 await order.save();
 return order;
};

export default{
 recalculateOrderLogic,
 createOrderLogic,
 createOrderFromShoppingListLogic,
 addItemToOrderLogic,
 updateOrderItemLogic,
 markOrderShippedLogic,
 markOrderDeliveredLogic,
 cancelOrderLogic
};