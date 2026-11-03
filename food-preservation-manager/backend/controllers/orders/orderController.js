import "../../models/orders/eventModel.js";
import Order from "../../models/orders/orderModel.js";

const populateOrder=query=>query.populate("client").populate("customer").populate("event");

const normalizeOrderPayload=body=>({
 ...body,
 client:body?.client||body?.customer||null,
 customer:body?.client||body?.customer||null,
 event:body?.event||null,
 status:["pending","confirmed","in-prep","completed","cancelled"].includes(String(body?.status||"").trim().toLowerCase())
  ?String(body.status).trim().toLowerCase()
  :"draft",
 serviceType:["pickup","full-service"].includes(String(body?.serviceType||"").trim().toLowerCase())
  ?String(body.serviceType).trim().toLowerCase()
  :"delivery",
 subtotal:body?.subtotal??body?.totals?.subtotal??"0",
 tax:body?.tax??body?.totals?.tax??"0",
 discount:body?.discount??body?.totals?.discount??"0",
 total:body?.total??body?.totals?.total??"0",
 totals:{
  subtotal:body?.subtotal??body?.totals?.subtotal??"0",
  tax:body?.tax??body?.totals?.tax??"0",
  discount:body?.discount??body?.totals?.discount??"0",
  total:body?.total??body?.totals?.total??"0"
 },
 source:body?.source||"event",
 notes:body?.notes||""
});

const buildQuery=query=>{
 const q={};
 if(query.customer)q.customer=query.customer;
 if(query.client)q.client=query.client;
 if(query.event)q.event=query.event;
 if(query.status)q.status=query.status;
 if(query.source)q.source=query.source;
 if(query.search){
  q.$or=[
   {orderNumber:{$regex:query.search,$options:"i"}},
   {source:{$regex:query.search,$options:"i"}},
   {notes:{$regex:query.search,$options:"i"}}
  ];
 }
 return q;
};

export const getOrders=async(req,res)=>{
 try{
  const orders=await populateOrder(Order.find(buildQuery(req.query))).sort({orderDate:-1,createdAt:-1});
  return res.status(200).json({success:true,count:orders.length,data:orders,orders});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch orders"});
 }
};

export const getOrderById=async(req,res)=>{
 try{
  const order=await populateOrder(Order.findById(req.params.id));
  if(!order)return res.status(404).json({success:false,message:"Order not found"});
  return res.status(200).json({success:true,data:order,order});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch order"});
 }
};

export const createOrder=async(req,res)=>{
 try{
  const order=await Order.create(normalizeOrderPayload(req.body));
  const populated=await populateOrder(Order.findById(order._id));
  return res.status(201).json({success:true,message:"Order created",data:populated,order:populated});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to create order"});
 }
};

export const updateOrder=async(req,res)=>{
 try{
  const order=await populateOrder(Order.findByIdAndUpdate(req.params.id,normalizeOrderPayload(req.body),{returnDocument:"after",runValidators:true}));
  if(!order)return res.status(404).json({success:false,message:"Order not found"});
  return res.status(200).json({success:true,message:"Order updated",data:order,order});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to update order"});
 }
};

export const deleteOrder=async(req,res)=>{
 try{
  const order=await Order.findByIdAndDelete(req.params.id);
  if(!order)return res.status(404).json({success:false,message:"Order not found"});
  return res.status(200).json({success:true,message:"Order deleted"});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to delete order"});
 }
};

