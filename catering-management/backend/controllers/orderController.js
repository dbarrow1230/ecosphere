// backend/controllers/orderController.js
import Order from "../models/orderModel.js";

export const createOrder=async(req,res)=>{
 try{
  const {client,event,orderNumber,status,serviceType,subtotal,tax,discount,total,notes}=req.body;
  const order=await Order.create({
   client,
   event,
   orderNumber,
   status,
   serviceType,
   subtotal,
   tax,
   discount,
   total,
   notes
  });
  res.status(201).json({success:true,message:"Order created successfully",order});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getOrders=async(req,res)=>{
 try{
  const orders=await Order.find()
   .populate("client")
   .populate("event")
   .sort({createdAt:-1});
  res.status(200).json({success:true,count:orders.length,orders});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSingleOrder=async(req,res)=>{
 try{
  const order=await Order.findById(req.params.id)
   .populate("client")
   .populate("event");
  if(!order){
   return res.status(404).json({success:false,message:"Order not found"});
  }
  res.status(200).json({success:true,order});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const updateOrder=async(req,res)=>{
 try{
  const order=await Order.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!order){
   return res.status(404).json({success:false,message:"Order not found"});
  }
  res.status(200).json({success:true,message:"Order updated successfully",order});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteOrder=async(req,res)=>{
 try{
  const order=await Order.findByIdAndDelete(req.params.id);
  if(!order){
   return res.status(404).json({success:false,message:"Order not found"});
  }
  res.status(200).json({success:true,message:"Order deleted successfully"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};