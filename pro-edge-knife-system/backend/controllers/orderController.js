import Order from "../models/orderModel.js";
import ProductTier from "../models/tierModel.js";

const createOrderNumber=()=>`PE-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

export const getOrders=async(req,res,next)=>{
 try{res.json(await Order.find().populate("tierRef").populate("selectedKnives.knifeTypeRef").sort({createdAt:-1}));}catch(error){next(error);}
};

export const getOrder=async(req,res,next)=>{
 try{
  const record=await Order.findById(req.params.id).populate("tierRef").populate("selectedKnives.knifeTypeRef");
  if(!record)return res.status(404).json({message:"Order not found"});
  res.json(record);
 }catch(error){next(error);}
};

export const createOrder=async(req,res,next)=>{
 try{
  const tier=await ProductTier.findById(req.body.tierRef);
  if(!tier)return res.status(400).json({message:"A valid product tier is required"});
  const quantity=Math.max(1,Number(req.body.quantity)||1);
  const unitPrice=Math.max(0,Number(req.body.unitPrice??tier.basePrice)||0);
  const selectedKnives=req.body.selectedKnives?.length?req.body.selectedKnives:tier.includedItems;
  const record=await Order.create({...req.body,orderNumber:req.body.orderNumber||createOrderNumber(),selectedKnives,quantity,unitPrice,total:quantity*unitPrice});
  res.status(201).json(await record.populate(["tierRef","selectedKnives.knifeTypeRef"]));
 }catch(error){if(error?.name==="ValidationError")return res.status(400).json({message:error.message});next(error);}
};

export const updateOrder=async(req,res,next)=>{
 try{
  const quantity=Math.max(1,Number(req.body.quantity)||1);
  const unitPrice=Math.max(0,Number(req.body.unitPrice)||0);
  const record=await Order.findByIdAndUpdate(req.params.id,{...req.body,quantity,unitPrice,total:quantity*unitPrice},{returnDocument:"after",runValidators:true});
  if(!record)return res.status(404).json({message:"Order not found"});
  res.json(await record.populate(["tierRef","selectedKnives.knifeTypeRef"]));
 }catch(error){if(error?.name==="ValidationError")return res.status(400).json({message:error.message});next(error);}
};

export const deleteOrder=async(req,res,next)=>{
 try{
  const record=await Order.findByIdAndDelete(req.params.id);
  if(!record)return res.status(404).json({message:"Order not found"});
  res.json({message:"Order deleted"});
 }catch(error){next(error);}
};

export const getDashboardSummary=async(req,res,next)=>{
 try{
  const [orders,tiers,pipeline]=await Promise.all([
   Order.countDocuments(),
   ProductTier.countDocuments({isActive:true}),
   Order.aggregate([{$group:{_id:"$status",count:{$sum:1},value:{$sum:"$total"}}},{$sort:{_id:1}}])
  ]);
  const totalValue=pipeline.reduce((sum,item)=>sum+item.value,0);
  res.json({orders,tiers,totalValue,pipeline});
 }catch(error){next(error);}
};
