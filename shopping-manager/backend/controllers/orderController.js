// /backend/controllers/orderController.js
import Order from '../models/orderModel.js';
import State from '../models/locations/stateModel.js';
import Country from '../models/locations/countryModel.js';

export const createOrder=async(req,res)=>{
try{
const{user,store,shoppingList,coupon,receipt,orderNumber,orderDate,type,status,paymentStatus,shippingStatus,carrier,trackingNumber,trackingUrl,shippingAddress1,shippingAddress2,shippingCity,shippingState,shippingCountry,shippingPostalCode,billingAddress1,billingAddress2,billingCity,billingState,billingCountry,billingPostalCode,subtotal,discountTotal,taxTotal,shippingTotal,refundTotal,total,estimatedDeliveryDate,shippedAt,deliveredAt,cancelledAt,notes}=req.body;
if(!user||!orderNumber)return res.status(400).json({success:false,message:'User and orderNumber are required'});
const existing=await Order.findOne({orderNumber:orderNumber.trim()});
if(existing)return res.status(409).json({success:false,message:'Order number already exists'});
const order=await Order.create({user,store,shoppingList,coupon,receipt,orderNumber,orderDate,type,status,paymentStatus,shippingStatus,carrier,trackingNumber,trackingUrl,shippingAddress1,shippingAddress2,shippingCity,shippingState,shippingCountry,shippingPostalCode,billingAddress1,billingAddress2,billingCity,billingState,billingCountry,billingPostalCode,subtotal,discountTotal,taxTotal,shippingTotal,refundTotal,total,estimatedDeliveryDate,shippedAt,deliveredAt,cancelledAt,notes});
res.status(201).json({success:true,message:'Order created successfully',order});
}catch(error){
res.status(500).json({success:false,message:'Error creating order',error:error.message});
}
};

export const getOrders=async(req,res)=>{
try{
const query={};
if(req.query.user)query.user=req.query.user;
if(req.query.store)query.store=req.query.store;
if(req.query.status)query.status=req.query.status;
if(req.query.paymentStatus)query.paymentStatus=req.query.paymentStatus;
if(req.query.shippingStatus)query.shippingStatus=req.query.shippingStatus;
if(req.query.type)query.type=req.query.type;
const orders=await Order.find(query)
.populate('user')
.populate('store')
.populate('shoppingList')
.populate('coupon')
.populate('receipt')
.populate('status')
.populate('paymentStatus')
.populate('shippingStatus')
.populate({path:'shippingState',model:State})
.populate({path:'shippingCountry',model:Country})
.populate({path:'billingState',model:State})
.populate({path:'billingCountry',model:Country})
.sort({createdAt:-1});
res.status(200).json({success:true,count:orders.length,orders});
}catch(error){
res.status(500).json({success:false,message:'Error fetching orders',error:error.message});
}
};

export const getOrderById=async(req,res)=>{
try{
const order=await Order.findById(req.params.id)
.populate('user')
.populate('store')
.populate('shoppingList')
.populate('coupon')
.populate('receipt')
.populate('status')
.populate('paymentStatus')
.populate('shippingStatus')
.populate({path:'shippingState',model:State})
.populate({path:'shippingCountry',model:Country})
.populate({path:'billingState',model:State})
.populate({path:'billingCountry',model:Country});
if(!order)return res.status(404).json({success:false,message:'Order not found'});
res.status(200).json({success:true,order});
}catch(error){
res.status(500).json({success:false,message:'Error fetching order',error:error.message});
}
};

export const getOrdersByUser=async(req,res)=>{
try{
const orders=await Order.find({user:req.params.userId})
.populate('user')
.populate('store')
.populate('shoppingList')
.populate('coupon')
.populate('receipt')
.populate('status')
.populate('paymentStatus')
.populate('shippingStatus')
.populate({path:'shippingState',model:State})
.populate({path:'shippingCountry',model:Country})
.populate({path:'billingState',model:State})
.populate({path:'billingCountry',model:Country})
.sort({createdAt:-1});
res.status(200).json({success:true,count:orders.length,orders});
}catch(error){
res.status(500).json({success:false,message:'Error fetching user orders',error:error.message});
}
};

export const getOrderByNumber=async(req,res)=>{
try{
const order=await Order.findOne({orderNumber:req.params.orderNumber.trim()})
.populate('user')
.populate('store')
.populate('shoppingList')
.populate('coupon')
.populate('receipt')
.populate('status')
.populate('paymentStatus')
.populate('shippingStatus')
.populate({path:'shippingState',model:State})
.populate({path:'shippingCountry',model:Country})
.populate({path:'billingState',model:State})
.populate({path:'billingCountry',model:Country});
if(!order)return res.status(404).json({success:false,message:'Order not found'});
res.status(200).json({success:true,order});
}catch(error){
res.status(500).json({success:false,message:'Error fetching order',error:error.message});
}
};

export const updateOrder=async(req,res)=>{
try{
const{user,store,shoppingList,coupon,receipt,orderNumber,orderDate,type,status,paymentStatus,shippingStatus,carrier,trackingNumber,trackingUrl,shippingAddress1,shippingAddress2,shippingCity,shippingState,shippingCountry,shippingPostalCode,billingAddress1,billingAddress2,billingCity,billingState,billingCountry,billingPostalCode,subtotal,discountTotal,taxTotal,shippingTotal,refundTotal,total,estimatedDeliveryDate,shippedAt,deliveredAt,cancelledAt,notes}=req.body;
const order=await Order.findById(req.params.id);
if(!order)return res.status(404).json({success:false,message:'Order not found'});
if(orderNumber&&orderNumber.trim()!==order.orderNumber){
const existing=await Order.findOne({orderNumber:orderNumber.trim(),_id:{$ne:req.params.id}});
if(existing)return res.status(409).json({success:false,message:'Order number already exists'});
}
order.user=user??order.user;
order.store=store!==undefined?store:order.store;
order.shoppingList=shoppingList!==undefined?shoppingList:order.shoppingList;
order.coupon=coupon!==undefined?coupon:order.coupon;
order.receipt=receipt!==undefined?receipt:order.receipt;
order.orderNumber=orderNumber??order.orderNumber;
order.orderDate=orderDate!==undefined?orderDate:order.orderDate;
order.type=type??order.type;
order.status=status!==undefined?status:order.status;
order.paymentStatus=paymentStatus!==undefined?paymentStatus:order.paymentStatus;
order.shippingStatus=shippingStatus!==undefined?shippingStatus:order.shippingStatus;
order.carrier=carrier??order.carrier;
order.trackingNumber=trackingNumber??order.trackingNumber;
order.trackingUrl=trackingUrl??order.trackingUrl;
order.shippingAddress1=shippingAddress1??order.shippingAddress1;
order.shippingAddress2=shippingAddress2??order.shippingAddress2;
order.shippingCity=shippingCity??order.shippingCity;
order.shippingState=shippingState!==undefined?shippingState:order.shippingState;
order.shippingCountry=shippingCountry!==undefined?shippingCountry:order.shippingCountry;
order.shippingPostalCode=shippingPostalCode??order.shippingPostalCode;
order.billingAddress1=billingAddress1??order.billingAddress1;
order.billingAddress2=billingAddress2??order.billingAddress2;
order.billingCity=billingCity??order.billingCity;
order.billingState=billingState!==undefined?billingState:order.billingState;
order.billingCountry=billingCountry!==undefined?billingCountry:order.billingCountry;
order.billingPostalCode=billingPostalCode??order.billingPostalCode;
order.subtotal=subtotal??order.subtotal;
order.discountTotal=discountTotal??order.discountTotal;
order.taxTotal=taxTotal??order.taxTotal;
order.shippingTotal=shippingTotal??order.shippingTotal;
order.refundTotal=refundTotal??order.refundTotal;
order.total=total??order.total;
order.estimatedDeliveryDate=estimatedDeliveryDate!==undefined?estimatedDeliveryDate:order.estimatedDeliveryDate;
order.shippedAt=shippedAt!==undefined?shippedAt:order.shippedAt;
order.deliveredAt=deliveredAt!==undefined?deliveredAt:order.deliveredAt;
order.cancelledAt=cancelledAt!==undefined?cancelledAt:order.cancelledAt;
order.notes=notes??order.notes;
await order.save();
const updatedOrder=await Order.findById(order._id)
.populate('user')
.populate('store')
.populate('shoppingList')
.populate('coupon')
.populate('receipt')
.populate('status')
.populate('paymentStatus')
.populate('shippingStatus')
.populate({path:'shippingState',model:State})
.populate({path:'shippingCountry',model:Country})
.populate({path:'billingState',model:State})
.populate({path:'billingCountry',model:Country});
res.status(200).json({success:true,message:'Order updated successfully',order:updatedOrder});
}catch(error){
res.status(500).json({success:false,message:'Error updating order',error:error.message});
}
};

export const deleteOrder=async(req,res)=>{
try{
const order=await Order.findById(req.params.id);
if(!order)return res.status(404).json({success:false,message:'Order not found'});
await Order.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Order deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting order',error:error.message});
}
};