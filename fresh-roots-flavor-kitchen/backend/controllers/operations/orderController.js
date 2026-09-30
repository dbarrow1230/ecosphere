import mongoose from "mongoose";
import Order from "../../models/operations/orderModel.js";

const fields=["client","event","orderNumber","status","serviceType","subtotal","tax","discount","total","notes"];
const pick=body=>Object.fromEntries(fields.filter(field=>body[field]!==undefined).map(field=>[field,body[field]]));
const validId=id=>mongoose.Types.ObjectId.isValid(id);
const hydrate=query=>query.populate("client","name firstName lastName company email").populate("event","eventName eventDate eventTime location");

export const getOrders=async(req,res,next)=>{try{const filter={};if(req.query.status)filter.status=req.query.status;const orders=await hydrate(Order.find(filter).sort({createdAt:-1}));res.json({orders});}catch(error){next(error);}};
export const getOrderById=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid order id"});const order=await hydrate(Order.findById(req.params.id));if(!order)return res.status(404).json({message:"Order not found"});res.json({order});}catch(error){next(error);}};
export const createOrder=async(req,res,next)=>{try{const created=await Order.create(pick(req.body));const order=await hydrate(Order.findById(created._id));res.status(201).json({message:"Order created successfully",order});}catch(error){next(error);}};
export const updateOrder=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid order id"});const order=await hydrate(Order.findByIdAndUpdate(req.params.id,pick(req.body),{returnDocument:"after",runValidators:true}));if(!order)return res.status(404).json({message:"Order not found"});res.json({message:"Order updated successfully",order});}catch(error){next(error);}};
export const deleteOrder=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid order id"});const order=await Order.findByIdAndDelete(req.params.id);if(!order)return res.status(404).json({message:"Order not found"});res.json({message:"Order deleted successfully"});}catch(error){next(error);}};
