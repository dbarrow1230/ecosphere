//backend/controllers/inventory/inventoryLotController.js
import mongoose from "mongoose";
import InventoryLot from "../../models/inventory/inventoryLotModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createInventoryLot=async(req,res)=>{
 try{
  const item=await InventoryLot.create(req.body);
  return res.status(201).json({success:true,message:"Inventory lot created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate inventory lot",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create inventory lot",error:error.message});
 }
};

export const getInventoryLots=async(req,res)=>{
 try{
  const {business_id,beverageItemRef,locationRef,status,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(beverageItemRef){
   if(!isValidObjectId(beverageItemRef)) return res.status(400).json({success:false,message:"Invalid beverageItemRef"});
   query.beverageItemRef=beverageItemRef;
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
   InventoryLot.find(query)
    .populate("business_id")
    .populate("beverageItemRef")
    .populate("locationRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   InventoryLot.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch inventory lots",error:error.message});
 }
};

export const getInventoryLotById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid inventory lot id"});

  const item=await InventoryLot.findById(id)
   .populate("business_id")
   .populate("beverageItemRef")
   .populate("locationRef");

  if(!item) return res.status(404).json({success:false,message:"Inventory lot not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch inventory lot",error:error.message});
 }
};

export const updateInventoryLot=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid inventory lot id"});

  const item=await InventoryLot.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
   .populate("business_id")
   .populate("beverageItemRef")
   .populate("locationRef");

  if(!item) return res.status(404).json({success:false,message:"Inventory lot not found"});

  return res.status(200).json({success:true,message:"Inventory lot updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate inventory lot",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update inventory lot",error:error.message});
 }
};

export const deleteInventoryLot=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid inventory lot id"});

  const item=await InventoryLot.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Inventory lot not found"});

  return res.status(200).json({success:true,message:"Inventory lot deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete inventory lot",error:error.message});
 }
};