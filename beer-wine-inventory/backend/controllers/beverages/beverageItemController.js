//backend/controllers/beverages/beverageItemController.js
import mongoose from "mongoose";
import BeverageItem from "../../models/beverages/beverageItemModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

const editableFields=Object.keys(BeverageItem.schema.paths).filter(key=>!["_id","__v","createdAt","updatedAt"].includes(key));
const beveragePayload=body=>Object.fromEntries(editableFields.filter(key=>Object.hasOwn(body,key)).map(key=>[key,body[key]]));
const validateReferences=async payload=>{
 for(const key of ["business_id","categoryRef","brandRef","preferredVendorRef","uomRef"]){
  if(!Object.hasOwn(payload,key))continue;
  if(!payload[key]&&["brandRef","preferredVendorRef"].includes(key)){payload[key]=null;continue;}
  const Model=BeverageItem.schema.path(key).options.ref;
  if(!isValidObjectId(payload[key])||!await Model.exists({_id:payload[key]})){
   const error=new Error(`Select an existing ${key.replace(/Ref$/,"").replace("business_id","business")}.`);
   error.name="ValidationError";
   throw error;
  }
 }
};

export const createBeverageItem=async(req,res)=>{
 try{
  const payload=beveragePayload(req.body);
  await validateReferences(payload);
  const item=await BeverageItem.create(payload);
  return res.status(201).json({success:true,message:"Beverage item created successfully",data:item});
 }catch(error){
  if(["ValidationError","CastError"].includes(error.name))return res.status(400).json({success:false,message:error.message});
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate beverage item",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to create beverage item",error:error.message});
 }
};

export const getBeverageItems=async(req,res)=>{
 try{
  const {business_id,categoryRef,brandRef,preferredVendorRef,uomRef,beverageType,isActive,search,page=1,limit=20,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  if(business_id){
   if(!isValidObjectId(business_id)) return res.status(400).json({success:false,message:"Invalid business_id"});
   query.business_id=business_id;
  }
  if(categoryRef){
   if(!isValidObjectId(categoryRef)) return res.status(400).json({success:false,message:"Invalid categoryRef"});
   query.categoryRef=categoryRef;
  }
  if(brandRef){
   if(!isValidObjectId(brandRef)) return res.status(400).json({success:false,message:"Invalid brandRef"});
   query.brandRef=brandRef;
  }
  if(preferredVendorRef){
   if(!isValidObjectId(preferredVendorRef)) return res.status(400).json({success:false,message:"Invalid preferredVendorRef"});
   query.preferredVendorRef=preferredVendorRef;
  }
  if(uomRef){
   if(!isValidObjectId(uomRef)) return res.status(400).json({success:false,message:"Invalid uomRef"});
   query.uomRef=uomRef;
  }
  if(beverageType) query.beverageType=beverageType;
  if(typeof isActive!=="undefined") query.isActive=isActive==="true";

  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {displayName:{$regex:search,$options:"i"}},
    {sku:{$regex:search,$options:"i"}},
    {barcode:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||20,1);
  const skip=(pageNum-1)*limitNum;
  const sort={ [sortBy]:sortOrder==="asc"?1:-1 };

  const [items,total]=await Promise.all([
   BeverageItem.find(query)
    .populate({path:"business_id",skipInvalidIds:true,transform:(doc,id)=>doc||id})
    .populate({path:"categoryRef",skipInvalidIds:true,transform:(doc,id)=>doc||id})
    .populate({path:"brandRef",skipInvalidIds:true,transform:(doc,id)=>doc||id})
    .populate({path:"preferredVendorRef",skipInvalidIds:true,transform:(doc,id)=>doc||id})
    .populate({path:"uomRef",skipInvalidIds:true,transform:(doc,id)=>doc||id})
    .sort(sort)
    .skip(skip)
    .limit(limitNum),
   BeverageItem.countDocuments(query)
  ]);

  return res.status(200).json({success:true,count:items.length,total,page:pageNum,pages:Math.ceil(total/limitNum),data:items});
 }catch(error){
  if(["ValidationError","CastError"].includes(error.name))return res.status(400).json({success:false,message:error.message});
  return res.status(500).json({success:false,message:"Failed to fetch beverage items",error:error.message});
 }
};

export const getBeverageItemById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid beverage item id"});

  const item=await BeverageItem.findById(id)
   .populate({path:"business_id",skipInvalidIds:true,transform:(doc,id)=>doc||id})
   .populate({path:"categoryRef",skipInvalidIds:true,transform:(doc,id)=>doc||id})
   .populate({path:"brandRef",skipInvalidIds:true,transform:(doc,id)=>doc||id})
   .populate({path:"preferredVendorRef",skipInvalidIds:true,transform:(doc,id)=>doc||id})
   .populate({path:"uomRef",skipInvalidIds:true,transform:(doc,id)=>doc||id});

  if(!item) return res.status(404).json({success:false,message:"Beverage item not found"});

  return res.status(200).json({success:true,data:item});
 }catch(error){
  if(["ValidationError","CastError"].includes(error.name))return res.status(400).json({success:false,message:error.message});
  return res.status(500).json({success:false,message:"Failed to fetch beverage item",error:error.message});
 }
};

export const updateBeverageItem=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid beverage item id"});

  const payload=beveragePayload(req.body);
  await validateReferences(payload);
  const item=await BeverageItem.findByIdAndUpdate(id,{$set:payload},{returnDocument:"after",runValidators:true})
   .populate({path:"business_id",skipInvalidIds:true,transform:(doc,id)=>doc||id})
   .populate({path:"categoryRef",skipInvalidIds:true,transform:(doc,id)=>doc||id})
   .populate({path:"brandRef",skipInvalidIds:true,transform:(doc,id)=>doc||id})
   .populate({path:"preferredVendorRef",skipInvalidIds:true,transform:(doc,id)=>doc||id})
   .populate({path:"uomRef",skipInvalidIds:true,transform:(doc,id)=>doc||id});

  if(!item) return res.status(404).json({success:false,message:"Beverage item not found"});

  return res.status(200).json({success:true,message:"Beverage item updated successfully",data:item});
 }catch(error){
  if(["ValidationError","CastError"].includes(error.name))return res.status(400).json({success:false,message:error.message});
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Duplicate beverage item",error:error.message});
  }
  return res.status(500).json({success:false,message:"Failed to update beverage item",error:error.message});
 }
};

export const deleteBeverageItem=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid beverage item id"});

  const item=await BeverageItem.findByIdAndDelete(id);
  if(!item) return res.status(404).json({success:false,message:"Beverage item not found"});

  return res.status(200).json({success:true,message:"Beverage item deleted successfully"});
 }catch(error){
  if(["ValidationError","CastError"].includes(error.name))return res.status(400).json({success:false,message:error.message});
  return res.status(500).json({success:false,message:"Failed to delete beverage item",error:error.message});
 }
};

export const toggleBeverageItemStatus=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id)) return res.status(400).json({success:false,message:"Invalid beverage item id"});

  const item=await BeverageItem.findById(id);
  if(!item) return res.status(404).json({success:false,message:"Beverage item not found"});

  item.isActive=!item.isActive;
  await item.save();

  return res.status(200).json({success:true,message:"Beverage item status updated successfully",data:item});
 }catch(error){
  if(["ValidationError","CastError"].includes(error.name))return res.status(400).json({success:false,message:error.message});
  return res.status(500).json({success:false,message:"Failed to toggle beverage item status",error:error.message});
 }
};
