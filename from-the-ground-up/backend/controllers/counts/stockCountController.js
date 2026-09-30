//backend/controllers/counts/stockCountController.js
import mongoose from "mongoose";
import StockCount from "../../models/counts/stockCountModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createStockCount=async(req,res)=>{
 try{
  const item=await StockCount.create(req.body);
  return res.status(201).json({success:true,message:"Stock count created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate stock count",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create stock count",error:error.message});
 }
};

export const getStockCounts=async(req,res)=>{
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
    {countNumber:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   StockCount.find(query)
    .populate("business_id")
    .populate("locationRef")
    .populate("createdByRef")
    .populate("approvedByRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   StockCount.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock counts",error:error.message});
 }
};

export const getStockCountById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock count id"});

  const item=await StockCount.findById(id)
   .populate("business_id")
   .populate("locationRef")
   .populate("createdByRef")
   .populate("approvedByRef");

  if(!item) return res.status(404).json({success:false,message:"Stock count not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch stock count",error:error.message});
 }
};

export const updateStockCount=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock count id"});

  const item=await StockCount.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
   .populate("business_id")
   .populate("locationRef")
   .populate("createdByRef")
   .populate("approvedByRef");

  if(!item) return res.status(404).json({success:false,message:"Stock count not found"});

  return res.status(200).json({success:true,message:"Stock count updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate stock count",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update stock count",error:error.message});
 }
};

export const deleteStockCount=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock count id"});

  const item=await StockCount.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Stock count not found"});

  return res.status(200).json({success:true,message:"Stock count deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete stock count",error:error.message});
 }
};

export const updateStockCountStatus=async(req,res)=>{
 try{
  const {id}=req.params;
  const {status}=req.body;

  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid stock count id"});
  if(!["draft","inProgress","submitted","approved","posted"].includes(status)){
   return res.status(400).json({success:false,message:"Invalid status value"});
  }

  const item=await StockCount.findById(id);
  if(!item) return res.status(404).json({success:false,message:"Stock count not found"});

  item.status=status;

  if(status==="approved"){
   item.approvedAt=new Date();
  }

  await item.save();

  return res.status(200).json({success:true,message:"Stock count status updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update stock count status",error:error.message});
 }
};
