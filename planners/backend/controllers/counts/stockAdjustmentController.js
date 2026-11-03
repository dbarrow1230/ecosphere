//backend/controllers/counts/stockAdjustmentController.js
import mongoose from "mongoose";
import StockAdjustment from "../../models/counts/stockAdjustmentModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createStockAdjustment=async(req,res)=>{
 try{
  const item=await StockAdjustment.create(req.body);
  return res.status(201).json({success:true,message:"Stock adjustment created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate stock adjustment",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create stock adjustment",error:error.message});
 }
};

export const getStockAdjustments=async(req,res)=>{
 try{
  const {business_id,locationRef,status,search,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(locationRef){
   if(!isValidObjectId(locationRef)) return res.status(400).json({success:false,message:"Invalid locationRef"});
   query.locationRef=locationRef;
  }
  if(status) query.status=status;

  if(search){
   query.$or=[
    {adjustmentNumber:{$regex:search,$options:"i"}},
    {reason:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   StockAdjustment.find(query)
    .populate("business_id")
    .populate("locationRef")
    .populate("createdByRef")
    .populate("approvedByRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   StockAdjustment.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock adjustments",error:error.message});
 }
};

export const getStockAdjustmentById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock adjustment id"});

  const item=await StockAdjustment.findById(id)
   .populate("business_id")
   .populate("locationRef")
   .populate("createdByRef")
   .populate("approvedByRef");

  if(!item) return res.status(404).json({success:false,message:"Stock adjustment not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock adjustment",error:error.message});
 }
};

export const updateStockAdjustment=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock adjustment id"});

  const item=await StockAdjustment.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("locationRef")
   .populate("createdByRef")
   .populate("approvedByRef");

  if(!item) return res.status(404).json({success:false,message:"Stock adjustment not found"});

  return res.status(200).json({success:true,message:"Stock adjustment updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate stock adjustment",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update stock adjustment",error:error.message});
 }
};

export const deleteStockAdjustment=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock adjustment id"});

  const item=await StockAdjustment.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Stock adjustment not found"});

  return res.status(200).json({success:true,message:"Stock adjustment deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete stock adjustment",error:error.message});
 }
};

export const updateStockAdjustmentStatus=async(req,res)=>{
 try{
  const {id}=req.params;
  const {status}=req.body;

  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock adjustment id"});
  if(!["draft","approved","posted","voided"].includes(status)){
   return res.status(400).json({success:false,message:"Invalid status value"});
  }

  const item=await StockAdjustment.findById(id);
  if(!item) return res.status(404).json({success:false,message:"Stock adjustment not found"});

  item.status=status;

  if(status==="approved"){
   item.approvedAt=new Date();
  }

  await item.save();

  return res.status(200).json({success:true,message:"Stock adjustment status updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update stock adjustment status",error:error.message});
 }
};