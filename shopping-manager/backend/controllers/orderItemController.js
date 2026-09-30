// /backend/controllers/orderItemController.js
import OrderItem from '../models/orderItemModel.js';

export const createOrderItem=async(req,res)=>{
try{
const{order,product,shoppingListItem,unit,store,quantityOrdered,quantityShipped,quantityDelivered,quantityCancelled,quantityReturned,unitPrice,discountAmount,taxAmount,subtotal,status,carrier,trackingNumber,trackingUrl,estimatedDeliveryDate,shippedAt,deliveredAt,notes}=req.body;
if(!order||!product||quantityOrdered===undefined||unitPrice===undefined||subtotal===undefined)return res.status(400).json({success:false,message:'Order, product, quantityOrdered, unitPrice, and subtotal are required'});
const orderItem=await OrderItem.create({order,product,shoppingListItem,unit,store,quantityOrdered,quantityShipped,quantityDelivered,quantityCancelled,quantityReturned,unitPrice,discountAmount,taxAmount,subtotal,status,carrier,trackingNumber,trackingUrl,estimatedDeliveryDate,shippedAt,deliveredAt,notes});
res.status(201).json({success:true,message:'Order item created successfully',orderItem});
}catch(error){
res.status(500).json({success:false,message:'Error creating order item',error:error.message});
}
};

export const getOrderItems=async(req,res)=>{
try{
const query={};
if(req.query.order)query.order=req.query.order;
if(req.query.product)query.product=req.query.product;
if(req.query.store)query.store=req.query.store;
if(req.query.status)query.status=req.query.status;
const orderItems=await OrderItem.find(query)
.populate('order')
.populate('product')
.populate('shoppingListItem')
.populate('unit')
.populate('store')
.populate('status')
.sort({createdAt:-1});
res.status(200).json({success:true,count:orderItems.length,orderItems});
}catch(error){
res.status(500).json({success:false,message:'Error fetching order items',error:error.message});
}
};

export const getOrderItemById=async(req,res)=>{
try{
const orderItem=await OrderItem.findById(req.params.id)
.populate('order')
.populate('product')
.populate('shoppingListItem')
.populate('unit')
.populate('store')
.populate('status');
if(!orderItem)return res.status(404).json({success:false,message:'Order item not found'});
res.status(200).json({success:true,orderItem});
}catch(error){
res.status(500).json({success:false,message:'Error fetching order item',error:error.message});
}
};

export const getOrderItemsByOrder=async(req,res)=>{
try{
const orderItems=await OrderItem.find({order:req.params.orderId})
.populate('order')
.populate('product')
.populate('shoppingListItem')
.populate('unit')
.populate('store')
.populate('status')
.sort({createdAt:-1});
res.status(200).json({success:true,count:orderItems.length,orderItems});
}catch(error){
res.status(500).json({success:false,message:'Error fetching order items for order',error:error.message});
}
};

export const updateOrderItem=async(req,res)=>{
try{
const{order,product,shoppingListItem,unit,store,quantityOrdered,quantityShipped,quantityDelivered,quantityCancelled,quantityReturned,unitPrice,discountAmount,taxAmount,subtotal,status,carrier,trackingNumber,trackingUrl,estimatedDeliveryDate,shippedAt,deliveredAt,notes}=req.body;
const orderItem=await OrderItem.findById(req.params.id);
if(!orderItem)return res.status(404).json({success:false,message:'Order item not found'});
orderItem.order=order??orderItem.order;
orderItem.product=product??orderItem.product;
orderItem.shoppingListItem=shoppingListItem!==undefined?shoppingListItem:orderItem.shoppingListItem;
orderItem.unit=unit!==undefined?unit:orderItem.unit;
orderItem.store=store!==undefined?store:orderItem.store;
orderItem.quantityOrdered=quantityOrdered??orderItem.quantityOrdered;
orderItem.quantityShipped=quantityShipped??orderItem.quantityShipped;
orderItem.quantityDelivered=quantityDelivered??orderItem.quantityDelivered;
orderItem.quantityCancelled=quantityCancelled??orderItem.quantityCancelled;
orderItem.quantityReturned=quantityReturned??orderItem.quantityReturned;
orderItem.unitPrice=unitPrice??orderItem.unitPrice;
orderItem.discountAmount=discountAmount??orderItem.discountAmount;
orderItem.taxAmount=taxAmount??orderItem.taxAmount;
orderItem.subtotal=subtotal??orderItem.subtotal;
orderItem.status=status!==undefined?status:orderItem.status;
orderItem.carrier=carrier??orderItem.carrier;
orderItem.trackingNumber=trackingNumber??orderItem.trackingNumber;
orderItem.trackingUrl=trackingUrl??orderItem.trackingUrl;
orderItem.estimatedDeliveryDate=estimatedDeliveryDate!==undefined?estimatedDeliveryDate:orderItem.estimatedDeliveryDate;
orderItem.shippedAt=shippedAt!==undefined?shippedAt:orderItem.shippedAt;
orderItem.deliveredAt=deliveredAt!==undefined?deliveredAt:orderItem.deliveredAt;
orderItem.notes=notes??orderItem.notes;
await orderItem.save();
const updatedOrderItem=await OrderItem.findById(orderItem._id)
.populate('order')
.populate('product')
.populate('shoppingListItem')
.populate('unit')
.populate('store')
.populate('status');
res.status(200).json({success:true,message:'Order item updated successfully',orderItem:updatedOrderItem});
}catch(error){
res.status(500).json({success:false,message:'Error updating order item',error:error.message});
}
};

export const deleteOrderItem=async(req,res)=>{
try{
const orderItem=await OrderItem.findById(req.params.id);
if(!orderItem)return res.status(404).json({success:false,message:'Order item not found'});
await OrderItem.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Order item deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting order item',error:error.message});
}
};