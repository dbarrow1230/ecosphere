//backend/controllers/transfers/stockTransferController.js
import mongoose from "mongoose";
import StockTransfer from "../../models/transfers/stockTransferModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createStockTransfer=async(req,res)=>{
 try{
  const item=await StockTransfer.create(req.body);
  return res.status(201).json({success:true,message:"Stock transfer created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate stock transfer",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create stock transfer",error:error.message});
 }
};

export const getStockTransfers=async(req,res)=>{
 try{
  const {business_id,fromLocationRef,toLocationRef,status,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(fromLocationRef){
   if(!isValidObjectId(fromLocationRef)) return res.status(400).json({success:false,message:"Invalid fromLocationRef"});
   query.fromLocationRef=fromLocationRef;
  }
  if(toLocationRef){
   if(!isValidObjectId(toLocationRef)) return res.status(400).json({success:false,message:"Invalid toLocationRef"});
   query.toLocationRef=toLocationRef;
  }
  if(status) query.status=status;

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   StockTransfer.find(query)
    .populate("business_id")
    .populate("fromLocationRef")
    .populate("toLocationRef")
    .populate("createdByRef")
    .populate("approvedByRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   StockTransfer.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock transfers",error:error.message});
 }
};

export const getStockTransferById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock transfer id"});

  const item=await StockTransfer.findById(id)
   .populate("business_id")
   .populate("fromLocationRef")
   .populate("toLocationRef")
   .populate("createdByRef")
   .populate("approvedByRef");

  if(!item) return res.status(404).json({success:false,message:"Stock transfer not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock transfer",error:error.message});
 }
};

export const updateStockTransfer=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock transfer id"});

  const item=await StockTransfer.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("fromLocationRef")
   .populate("toLocationRef")
   .populate("createdByRef")
   .populate("approvedByRef");

  if(!item) return res.status(404).json({success:false,message:"Stock transfer not found"});

  return res.status(200).json({success:true,message:"Stock transfer updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate stock transfer",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update stock transfer",error:error.message});
 }
};

export const deleteStockTransfer=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock transfer id"});

  const item=await StockTransfer.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Stock transfer not found"});

  return res.status(200).json({success:true,message:"Stock transfer deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete stock transfer",error:error.message});
 }
};

export const updateStockTransferStatus=async(req,res)=>{
 try{
  const {id}=req.params;
  const {status}=req.body;

  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock transfer id"});
  if(!["draft","approved","inTransit","received","cancelled"].includes(status)){
   return res.status(400).json({success:false,message:"Invalid status value"});
  }

  const item=await StockTransfer.findById(id);
  if(!item) return res.status(404).json({success:false,message:"Stock transfer not found"});

  item.status=status;

  if(status==="inTransit"){
   item.shippedAt=new Date();
  }
  if(status==="received"){
   item.receivedAt=new Date();
  }

  await item.save();

  return res.status(200).json({success:true,message:"Stock transfer status updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update stock transfer status",error:error.message});
 }
};