//backend/controllers/counts/stockCountLineController.js
import mongoose from "mongoose";
import StockCountLine from "../../models/counts/stockCountLineModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createStockCountLine=async(req,res)=>{
 try{
  const item=await StockCountLine.create(req.body);
  return res.status(201).json({success:true,message:"Stock count line created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate stock count line",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create stock count line",error:error.message});
 }
};

export const getStockCountLines=async(req,res)=>{
 try{
  const {business_id,stockCountRef,beverageItemRef,search,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(stockCountRef){
   if(!isValidObjectId(stockCountRef)) return res.status(400).json({success:false,message:"Invalid stockCountRef"});
   query.stockCountRef=stockCountRef;
  }
  if(beverageItemRef){
   if(!isValidObjectId(beverageItemRef)) return res.status(400).json({success:false,message:"Invalid beverageItemRef"});
   query.beverageItemRef=beverageItemRef;
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
   StockCountLine.find(query)
    .populate("business_id")
    .populate("stockCountRef")
    .populate("beverageItemRef")
    .populate("countedByRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   StockCountLine.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock count lines",error:error.message});
 }
};

export const getStockCountLineById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock count line id"});

  const item=await StockCountLine.findById(id)
   .populate("business_id")
   .populate("stockCountRef")
   .populate("beverageItemRef")
   .populate("countedByRef");

  if(!item) return res.status(404).json({success:false,message:"Stock count line not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock count line",error:error.message});
 }
};

export const updateStockCountLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock count line id"});

  const item=await StockCountLine.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
   .populate("business_id")
   .populate("stockCountRef")
   .populate("beverageItemRef")
   .populate("countedByRef");

  if(!item) return res.status(404).json({success:false,message:"Stock count line not found"});

  return res.status(200).json({success:true,message:"Stock count line updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate stock count line",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update stock count line",error:error.message});
 }
};

export const deleteStockCountLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock count line id"});

  const item=await StockCountLine.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Stock count line not found"});

  return res.status(200).json({success:true,message:"Stock count line deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete stock count line",error:error.message});
 }
};