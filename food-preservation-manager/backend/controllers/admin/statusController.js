import Status from "../../models/admin/statusModel.js";

export const getStatuses=async(req,res)=>{
 try{
  const q={};
  if(req.query.group)q.group=req.query.group;
  if(req.query.isActive!==undefined)q.isActive=req.query.isActive==="true";
  if(req.query.search){
   q.$or=[
    {name:{$regex:req.query.search,$options:"i"}},
    {code:{$regex:req.query.search,$options:"i"}},
    {group:{$regex:req.query.search,$options:"i"}},
    {description:{$regex:req.query.search,$options:"i"}}
   ];
  }
  const statuses=await Status.find(q).sort({group:1,sortOrder:1,name:1});
  return res.status(200).json({success:true,count:statuses.length,data:statuses,statuses});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch statuses"});
 }
};

export const getStatusById=async(req,res)=>{
 try{
  const status=await Status.findById(req.params.id);
  if(!status)return res.status(404).json({success:false,message:"Status not found"});
  return res.status(200).json({success:true,data:status,status});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch status"});
 }
};

export const createStatus=async(req,res)=>{
 try{
  const status=await Status.create(req.body);
  return res.status(201).json({success:true,message:"Status created",data:status,status});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to create status"});
 }
};

export const updateStatus=async(req,res)=>{
 try{
  const status=await Status.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!status)return res.status(404).json({success:false,message:"Status not found"});
  return res.status(200).json({success:true,message:"Status updated",data:status,status});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to update status"});
 }
};

export const deleteStatus=async(req,res)=>{
 try{
  const status=await Status.findByIdAndDelete(req.params.id);
  if(!status)return res.status(404).json({success:false,message:"Status not found"});
  return res.status(200).json({success:true,message:"Status deleted"});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to delete status"});
 }
};

