import mongoose from "mongoose";
import Order from "../../models/admin/orderModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);
const populateOrder=query=>query.populate("client").populate("event");

export const createOrder=async(req,res)=>{
 try{
  const order=await Order.create(req.body);
  const populated=await populateOrder(Order.findById(order._id));
  return res.status(201).json({success:true,message:"Order created successfully",order:populated,data:populated});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Order number already exists",error:error.message});
  return res.status(500).json({success:false,message:"Failed to create order",error:error.message});
 }
};

export const getOrders=async(req,res)=>{
 try{
  const orders=await populateOrder(Order.find({}).sort({createdAt:-1}));
  return res.status(200).json({success:true,orders,data:orders});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch orders",error:error.message});
 }
};

export const getOrderById=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid order id"});
  const order=await populateOrder(Order.findById(req.params.id));
  if(!order)return res.status(404).json({success:false,message:"Order not found"});
  return res.status(200).json({success:true,order,data:order});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch order",error:error.message});
 }
};

export const updateOrder=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid order id"});
  const order=await populateOrder(Order.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}));
  if(!order)return res.status(404).json({success:false,message:"Order not found"});
  return res.status(200).json({success:true,message:"Order updated successfully",order,data:order});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Order number already exists",error:error.message});
  return res.status(500).json({success:false,message:"Failed to update order",error:error.message});
 }
};

export const deleteOrder=async(req,res)=>{
 try{
  if(!isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid order id"});
  const order=await Order.findByIdAndDelete(req.params.id);
  if(!order)return res.status(404).json({success:false,message:"Order not found"});
  return res.status(200).json({success:true,message:"Order deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete order",error:error.message});
 }
};
