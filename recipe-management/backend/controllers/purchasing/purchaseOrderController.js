//backend/controllers/purchasing/purchaseOrderController.js
import mongoose from "mongoose";
import PurchaseOrder from "../../models/purchasing/purchaseOrderModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createPurchaseOrder=async(req,res)=>{
 try{
  const item=await PurchaseOrder.create(req.body);
  return res.status(201).json({success:true,message:"Purchase order created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate purchase order",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create purchase order",error:error.message});
 }
};

export const getPurchaseOrders=async(req,res)=>{
 try{
  const {business_id,vendorRef,locationRef,status,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(vendorRef){
   if(!isValidObjectId(vendorRef)) return res.status(400).json({success:false,message:"Invalid vendorRef"});
   query.vendorRef=vendorRef;
  }
  if(locationRef){
   if(!isValidObjectId(locationRef)) return res.status(400).json({success:false,message:"Invalid locationRef"});
   query.locationRef=locationRef;
  }
  if(status) query.status=status;

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   PurchaseOrder.find(query)
    .populate("business_id")
    .populate("vendorRef")
    .populate("locationRef")
    .populate("createdByRef")
    .populate("approvedByRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   PurchaseOrder.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch purchase orders",error:error.message});
 }
};

export const getPurchaseOrderById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid purchase order id"});

  const item=await PurchaseOrder.findById(id)
   .populate("business_id")
   .populate("vendorRef")
   .populate("locationRef")
   .populate("createdByRef")
   .populate("approvedByRef");

  if(!item) return res.status(404).json({success:false,message:"Purchase order not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch purchase order",error:error.message});
 }
};

export const updatePurchaseOrder=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid purchase order id"});

  const item=await PurchaseOrder.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("vendorRef")
   .populate("locationRef")
   .populate("createdByRef")
   .populate("approvedByRef");

  if(!item) return res.status(404).json({success:false,message:"Purchase order not found"});

  return res.status(200).json({success:true,message:"Purchase order updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate purchase order",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update purchase order",error:error.message});
 }
};

export const deletePurchaseOrder=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid purchase order id"});

  const item=await PurchaseOrder.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Purchase order not found"});

  return res.status(200).json({success:true,message:"Purchase order deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete purchase order",error:error.message});
 }
};

export const updatePurchaseOrderStatus=async(req,res)=>{
 try{
  const {id}=req.params;
  const {status}=req.body;

  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid purchase order id"});
  if(!["draft","submitted","approved","sent","partialReceived","received","cancelled","closed"].includes(status)){
   return res.status(400).json({success:false,message:"Invalid status value"});
  }

  const item=await PurchaseOrder.findById(id);
  if(!item) return res.status(404).json({success:false,message:"Purchase order not found"});

  item.status=status;

  if(status==="approved"){
   item.approvedAt=new Date();
  }

  await item.save();

  return res.status(200).json({success:true,message:"Purchase order status updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update purchase order status",error:error.message});
 }
};