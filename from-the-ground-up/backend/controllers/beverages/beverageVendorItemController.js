//backend/controllers/beverages/beverageVendorItemController.js
import mongoose from "mongoose";
import BeverageVendorItem from "../../models/beverages/beverageVendorItemModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

export const createBeverageVendorItem=async(req,res)=>{
 try{
  const item=await BeverageVendorItem.create(req.body);
  return res.status(201).json({success:true,message:"Beverage vendor item created successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate beverage vendor item",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create beverage vendor item",error:error.message});
 }
};

export const getBeverageVendorItems=async(req,res)=>{
 try{
  const {business_id,beverageItemRef,vendorRef,isPreferred,isActive,search,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(beverageItemRef){
   if(!isValidObjectId(beverageItemRef)) return res.status(400).json({success:false,message:"Invalid beverageItemRef"});
   query.beverageItemRef=beverageItemRef;
  }
  if(vendorRef){
   if(!isValidObjectId(vendorRef)) return res.status(400).json({success:false,message:"Invalid vendorRef"});
   query.vendorRef=vendorRef;
  }
  if(typeof isPreferred!=="undefined") query.isPreferred=isPreferred==="true";
  if(typeof isActive!=="undefined") query.isActive=isActive==="true";

  if(search){
   query.$or=[
    {vendorSku:{$regex:search,$options:"i"}},
    {vendorItemName:{$regex:search,$options:"i"}},
    {packSize:{$regex:search,$options:"i"}}
   ];
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   BeverageVendorItem.find(query)
    .populate("business_id")
    .populate("beverageItemRef")
    .populate("vendorRef")
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   BeverageVendorItem.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch beverage vendor items",error:error.message});
 }
};

export const getBeverageVendorItemById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid beverage vendor item id"});

  const item=await BeverageVendorItem.findById(id)
   .populate("business_id")
   .populate("beverageItemRef")
   .populate("vendorRef");

  if(!item) return res.status(404).json({success:false,message:"Beverage vendor item not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch beverage vendor item",error:error.message});
 }
};

export const updateBeverageVendorItem=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid beverage vendor item id"});

  const item=await BeverageVendorItem.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
   .populate("business_id")
   .populate("beverageItemRef")
   .populate("vendorRef");

  if(!item) return res.status(404).json({success:false,message:"Beverage vendor item not found"});

  return res.status(200).json({success:true,message:"Beverage vendor item updated successfully",data:item});
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate beverage vendor item",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update beverage vendor item",error:error.message});
 }
};

export const deleteBeverageVendorItem=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid beverage vendor item id"});

  const item=await BeverageVendorItem.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Beverage vendor item not found"});

  return res.status(200).json({success:true,message:"Beverage vendor item deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete beverage vendor item",error:error.message});
 }
};

export const toggleBeverageVendorItemStatus=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid beverage vendor item id"});

  const item=await BeverageVendorItem.findById(id);
  if(!item) return res.status(404).json({success:false,message:"Beverage vendor item not found"});

  item.isActive=!item.isActive;
  await item.save();

  return res.status(200).json({success:true,message:"Beverage vendor item status updated successfully",data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to toggle beverage vendor item status",error:error.message});
 }
};