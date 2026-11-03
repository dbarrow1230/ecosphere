import StorageLocation from "../../models/inventory/storageLocationModel.js";

export const getStorageLocations=async(req,res)=>{
 try{
  const q={};
  if(req.query.type)q.type=req.query.type;
  if(req.query.isActive!==undefined)q.isActive=req.query.isActive==="true";
  if(req.query.search){
   q.$or=[
    {name:{$regex:req.query.search,$options:"i"}},
    {code:{$regex:req.query.search,$options:"i"}},
    {type:{$regex:req.query.search,$options:"i"}},
    {description:{$regex:req.query.search,$options:"i"}},
    {notes:{$regex:req.query.search,$options:"i"}}
   ];
  }
  const locations=await StorageLocation.find(q).sort({name:1});
  return res.status(200).json({success:true,count:locations.length,data:locations,storageLocations:locations});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch storage locations"});
 }
};

export const getStorageLocationById=async(req,res)=>{
 try{
  const location=await StorageLocation.findById(req.params.id);
  if(!location)return res.status(404).json({success:false,message:"Storage location not found"});
  return res.status(200).json({success:true,data:location,storageLocation:location});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch storage location"});
 }
};

export const createStorageLocation=async(req,res)=>{
 try{
  const location=await StorageLocation.create(req.body);
  return res.status(201).json({success:true,message:"Storage location created",data:location,storageLocation:location});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to create storage location"});
 }
};

export const updateStorageLocation=async(req,res)=>{
 try{
  const location=await StorageLocation.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!location)return res.status(404).json({success:false,message:"Storage location not found"});
  return res.status(200).json({success:true,message:"Storage location updated",data:location,storageLocation:location});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to update storage location"});
 }
};

export const deleteStorageLocation=async(req,res)=>{
 try{
  const location=await StorageLocation.findByIdAndDelete(req.params.id);
  if(!location)return res.status(404).json({success:false,message:"Storage location not found"});
  return res.status(200).json({success:true,message:"Storage location deleted"});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to delete storage location"});
 }
};

