import mongoose from "mongoose";
import Notebook from "../models/notebookModel.js";

export const createNotebook=async(req,res)=>{
 try{
  const {name,description,color,isArchived=false}=req.body;
  const loggedInUserId=req.user?._id;


  if(!loggedInUserId)
   return res.status(401).json({success:false,message:"Unauthorized"});

  if(!name)
   return res.status(400).json({success:false,message:"name is required"});

  const notebook=await Notebook.create({
   user:loggedInUserId,
   name,
   description,
   color,
   isArchived
  });

  const populatedNotebook=await Notebook.findById(notebook._id)
  .populate("user","username email");

  return res.status(201).json({success:true,message:"Notebook created successfully",data:populatedNotebook});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to create notebook",error:error.message});
 }
};

export const getNotebooks=async(req,res)=>{
 try{
  const {isArchived,name}=req.query;
  const loggedInUserId=req.user?._id;
  const query={};


  if(!loggedInUserId)
   return res.status(401).json({success:false,message:"Unauthorized"});

  query.user=loggedInUserId;

  if(isArchived!==undefined)query.isArchived=isArchived==="true";
  if(name)query.name=name;

  console.log("getNotebooks query:",query);

  const notebooks=await Notebook.find(query)
  .populate("user","username email")
  .sort({createdAt:-1});

  return res.status(200).json({success:true,count:notebooks.length,data:notebooks});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch notebooks",error:error.message});
 }
};

export const getNotebookById=async(req,res)=>{
 try{
  const {id}=req.params;
  const loggedInUserId=req.user?._id;

  if(!loggedInUserId)
   return res.status(401).json({success:false,message:"Unauthorized"});

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid notebook id"});

  const notebook=await Notebook.findOne({_id:id,user:loggedInUserId})
  .populate("user","username email");

  if(!notebook)
   return res.status(404).json({success:false,message:"Notebook not found"});

  return res.status(200).json({success:true,data:notebook});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch notebook",error:error.message});
 }
};

export const updateNotebook=async(req,res)=>{
 try{
  const {id}=req.params;
  const loggedInUserId=req.user?._id;
  const updateData={...req.body};

  if(!loggedInUserId)
   return res.status(401).json({success:false,message:"Unauthorized"});

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid notebook id"});

  delete updateData.user;

  const notebook=await Notebook.findOneAndUpdate(
   {_id:id,user:loggedInUserId},
   updateData,
   {returnDocument:"after",runValidators:true}
  )
  .populate("user","username email");

  if(!notebook)
   return res.status(404).json({success:false,message:"Notebook not found"});

  return res.status(200).json({success:true,message:"Notebook updated successfully",data:notebook});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to update notebook",error:error.message});
 }
};

export const deleteNotebook=async(req,res)=>{
 try{
  const {id}=req.params;
  const loggedInUserId=req.user?._id;

  if(!loggedInUserId)
   return res.status(401).json({success:false,message:"Unauthorized"});

  if(!mongoose.Types.ObjectId.isValid(id))
   return res.status(400).json({success:false,message:"Invalid notebook id"});

  const notebook=await Notebook.findOneAndDelete({_id:id,user:loggedInUserId});

  if(!notebook)
   return res.status(404).json({success:false,message:"Notebook not found"});

  return res.status(200).json({success:true,message:"Notebook deleted successfully"});
 }
 catch(error){
  return res.status(500).json({success:false,message:"Failed to delete notebook",error:error.message});
 }
};