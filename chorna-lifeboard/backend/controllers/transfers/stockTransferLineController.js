//backend/controllers/transfers/stockTransferLineController.js
import mongoose from "mongoose";
import StockTransferLine from "../../models/transfers/stockTransferLineModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createStockTransferLine=async(req,res)=>{
 try{
  const item=await StockTransferLine.create(req.body);
  return res.status(201).json({success:true,message:"Stock transfer line created successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create stock transfer line",error:error.message});
 }
};

export const getStockTransferLines=async(req,res)=>{
 try{
  const {business_id,stockTransferRef,beverageItemRef,lotRef,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(stockTransferRef){
   if(!isValidObjectId(stockTransferRef)) return res.status(400).json({success:false,message:"Invalid stockTransferRef"});
   query.stockTransferRef=stockTransferRef;
  }
  if(beverageItemRef){
   if(!isValidObjectId(beverageItemRef)) return res.status(400).json({success:false,message:"Invalid beverageItemRef"});
   query.beverageItemRef=beverageItemRef;
  }
  if(lotRef){
   if(!isValidObjectId(lotRef)) return res.status(400).json({success:false,message:"Invalid lotRef"});
   query.lotRef=lotRef;
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   StockTransferLine.find(query)
    .populate("business_id")
    .populate("stockTransferRef")
    .populate("beverageItemRef")
    .populate("lotRef")
    .populate("uomRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   StockTransferLine.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock transfer lines",error:error.message});
 }
};

export const getStockTransferLineById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock transfer line id"});

  const item=await StockTransferLine.findById(id)
   .populate("business_id")
   .populate("stockTransferRef")
   .populate("beverageItemRef")
   .populate("lotRef")
   .populate("uomRef");

  if(!item) return res.status(404).json({success:false,message:"Stock transfer line not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock transfer line",error:error.message});
 }
};

export const updateStockTransferLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock transfer line id"});

  const item=await StockTransferLine.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate("business_id")
   .populate("stockTransferRef")
   .populate("beverageItemRef")
   .populate("lotRef")
   .populate("uomRef");

  if(!item) return res.status(404).json({success:false,message:"Stock transfer line not found"});

  return res.status(200).json({success:true,message:"Stock transfer line updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update stock transfer line",error:error.message});
 }
};

export const deleteStockTransferLine=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock transfer line id"});

  const item=await StockTransferLine.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Stock transfer line not found"});

  return res.status(200).json({success:true,message:"Stock transfer line deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete stock transfer line",error:error.message});
 }
};