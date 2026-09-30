//backend/controllers/counts/stockAdjustmentLineController.js
import mongoose from "mongoose";
import StockAdjustmentLine from "../../models/counts/stockAdjustmentLineModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createStockAdjustmentLine=async(req,res)=>{
 try{
  const item=await StockAdjustmentLine.create(req.body);
  return res.status(201).json({success:true,message:"Stock adjustment line created successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create stock adjustment line",error:error.message});
 }
};

export const getStockAdjustmentLines=async(req,res)=>{
 try{
  const {business_id,stockAdjustmentRef,beverageItemRef,lotRef,search,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(stockAdjustmentRef){
   if(!isValidObjectId(stockAdjustmentRef)) return res.status(400).json({success:false,message:"Invalid stockAdjustmentRef"});
   query.stockAdjustmentRef=stockAdjustmentRef;
  }
  if(beverageItemRef){
   if(!isValidObjectId(beverageItemRef)) return res.status(400).json({success:false,message:"Invalid beverageItemRef"});
   query.beverageItemRef=beverageItemRef;
  }
  if(lotRef){
   if(!isValidObjectId(lotRef)) return res.status(400).json({success:false,message:"Invalid lotRef"});
   query.lotRef=lotRef;
  }

  if(search){
   query.$or=[
    {reasonCode:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   StockAdjustmentLine.find(query)
    .populate("business_id")
    .populate("stockAdjustmentRef")
    .populate("beverageItemRef")
    .populate("lotRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   StockAdjustmentLine.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock adjustment lines",error:error.message});
 }
};

export const getStockAdjustmentLineById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock adjustment line id"});

  const item=await StockAdjustmentLine.findById(id)
   .populate("business_id")
   .populate("stockAdjustmentRef")
   .populate("beverageItemRef")
   .populate("lotRef");

  if(!item) return res.status(404).json({success:false,message:"Stock adjustment line not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock adjustment line",error:error.message});
 }
};

export const updateStockAdjustmentLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock adjustment line id"});

  const item=await StockAdjustmentLine.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
   .populate("business_id")
   .populate("stockAdjustmentRef")
   .populate("beverageItemRef")
   .populate("lotRef");

  if(!item) return res.status(404).json({success:false,message:"Stock adjustment line not found"});

  return res.status(200).json({success:true,message:"Stock adjustment line updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update stock adjustment line",error:error.message});
 }
};

export const deleteStockAdjustmentLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock adjustment line id"});

  const item=await StockAdjustmentLine.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Stock adjustment line not found"});

  return res.status(200).json({success:true,message:"Stock adjustment line deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete stock adjustment line",error:error.message});
 }
};