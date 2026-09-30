// backend/controllers/reference/statusController.js
import mongoose from "mongoose";
import Status from "../../models/reference/statusModel.js";

const formatStatus=doc=>{
 const item=doc?.toObject?doc.toObject():doc;
 if(!item)return item;
 return item;
};

export const createStatus=async(req,res)=>{
 try{
  const{name,code,description,color,isDefault}=req.body;

  if(!name)return res.status(400).json({success:false,message:"Name is required"});
  if(!code)return res.status(400).json({success:false,message:"Code is required"});

  if(isDefault===true){
   await Status.updateMany({isDefault:true},{$set:{isDefault:false}});
  }

  const status=new Status({
   name:name.trim(),
   code:String(code).trim().toLowerCase(),
   description:description||"",
   color:color||"",
   isDefault:Boolean(isDefault)
  });

  const saved=await status.save();
  return res.status(201).json({success:true,message:"Status created successfully",status:formatStatus(saved)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error creating status",error:error.message});
 }
};

export const getStatuses=async(req,res)=>{
 try{
  const{search}=req.query;
  const query={};

  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {code:{$regex:search,$options:"i"}},
    {description:{$regex:search,$options:"i"}}
   ];
  }

  const statuses=await Status.find(query).sort({name:1});
  return res.status(200).json({success:true,count:statuses.length,statuses:statuses.map(formatStatus)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching statuses",error:error.message});
 }
};

export const getStatusById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid status id"});

  const status=await Status.findById(id);
  if(!status)return res.status(404).json({success:false,message:"Status not found"});

  return res.status(200).json({success:true,status:formatStatus(status)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching status",error:error.message});
 }
};

export const updateStatus=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid status id"});

  const{name,code,description,color,isDefault}=req.body;
  const updateData={};

  if(isDefault===true){
   await Status.updateMany({_id:{$ne:id},isDefault:true},{$set:{isDefault:false}});
  }

  if(name!==undefined)updateData.name=String(name).trim();
  if(code!==undefined)updateData.code=String(code).trim().toLowerCase();
  if(description!==undefined)updateData.description=description;
  if(color!==undefined)updateData.color=color;
  if(isDefault!==undefined)updateData.isDefault=Boolean(isDefault);

  const status=await Status.findByIdAndUpdate(id,updateData,{returnDocument:"after",runValidators:true});
  if(!status)return res.status(404).json({success:false,message:"Status not found"});

  return res.status(200).json({success:true,message:"Status updated successfully",status:formatStatus(status)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error updating status",error:error.message});
 }
};

export const deleteStatus=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid status id"});

  const status=await Status.findById(id);
  if(!status)return res.status(404).json({success:false,message:"Status not found"});
  if(status.isDefault)return res.status(400).json({success:false,message:"Default status cannot be deleted"});

  await Status.findByIdAndDelete(id);
  return res.status(200).json({success:true,message:"Status deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting status",error:error.message});
 }
};