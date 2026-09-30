//backend/controllers/content/resourceController.js
import mongoose from "mongoose";
import Resource from "../../models/content/resourceModel.js";

export const createResource=async(req,res)=>{
 try{
  const{
   title,
   slug,
   resourceType,
   category,
   summary,
   content,
   coverImage,
   fileName,
   fileUrl,
   externalUrl,
   tags,
   publishedAt,
   isFeatured,
   isPublished,
   isActive,
   notes
  }=req.body;

  if(!title){
   return res.status(400).json({message:"Title is required"});
  }

  const resource=new Resource({
   title,
   slug,
   resourceType,
   category,
   summary,
   content,
   coverImage,
   fileName,
   fileUrl,
   externalUrl,
   tags:Array.isArray(tags)?tags:[],
   publishedAt,
   isFeatured:typeof isFeatured==="boolean"?isFeatured:false,
   isPublished:typeof isPublished==="boolean"?isPublished:false,
   isActive:typeof isActive==="boolean"?isActive:true,
   notes,
   createdBy:req.user?req.user._id:null,
   updatedBy:req.user?req.user._id:null
  });

  const saved=await resource.save();

  const populated=await Resource.findById(saved._id)
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(201).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error creating resource",error:error.message});
 }
};

export const getResources=async(req,res)=>{
 try{
  const{resourceType,category,isFeatured,isPublished,isActive,search}=req.query;

  const filter={};

  if(resourceType){
   filter.resourceType=resourceType;
  }
  if(category){
   filter.category=category;
  }
  if(typeof isFeatured!=="undefined"){
   filter.isFeatured=isFeatured==="true";
  }
  if(typeof isPublished!=="undefined"){
   filter.isPublished=isPublished==="true";
  }
  if(typeof isActive!=="undefined"){
   filter.isActive=isActive==="true";
  }
  if(search){
   filter.$or=[
    {title:{$regex:search,$options:"i"}},
    {slug:{$regex:search,$options:"i"}},
    {category:{$regex:search,$options:"i"}},
    {summary:{$regex:search,$options:"i"}},
    {content:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}},
    {tags:{$regex:search,$options:"i"}}
   ];
  }

  const resources=await Resource.find(filter)
   .populate("createdBy","name email")
   .populate("updatedBy","name email")
   .sort({createdAt:-1});

  return res.status(200).json(resources);
 }catch(error){
  return res.status(500).json({message:"Error fetching resources",error:error.message});
 }
};

export const getResourceById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid resource id"});
  }

  const resource=await Resource.findById(id)
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!resource){
   return res.status(404).json({message:"Resource not found"});
  }

  return res.status(200).json(resource);
 }catch(error){
  return res.status(500).json({message:"Error fetching resource",error:error.message});
 }
};

export const updateResource=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid resource id"});
  }

  const{
   title,
   slug,
   resourceType,
   category,
   summary,
   content,
   coverImage,
   fileName,
   fileUrl,
   externalUrl,
   tags,
   publishedAt,
   isFeatured,
   isPublished,
   isActive,
   notes
  }=req.body;

  const updateData={};

  if(typeof title!=="undefined")updateData.title=title;
  if(typeof slug!=="undefined")updateData.slug=slug;
  if(typeof resourceType!=="undefined")updateData.resourceType=resourceType;
  if(typeof category!=="undefined")updateData.category=category;
  if(typeof summary!=="undefined")updateData.summary=summary;
  if(typeof content!=="undefined")updateData.content=content;
  if(typeof coverImage!=="undefined")updateData.coverImage=coverImage;
  if(typeof fileName!=="undefined")updateData.fileName=fileName;
  if(typeof fileUrl!=="undefined")updateData.fileUrl=fileUrl;
  if(typeof externalUrl!=="undefined")updateData.externalUrl=externalUrl;
  if(typeof tags!=="undefined")updateData.tags=Array.isArray(tags)?tags:[];
  if(typeof publishedAt!=="undefined")updateData.publishedAt=publishedAt;
  if(typeof isFeatured!=="undefined")updateData.isFeatured=isFeatured;
  if(typeof isPublished!=="undefined")updateData.isPublished=isPublished;
  if(typeof isActive!=="undefined")updateData.isActive=isActive;
  if(typeof notes!=="undefined")updateData.notes=notes;
  updateData.updatedBy=req.user?req.user._id:null;

  const updated=await Resource.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!updated){
   return res.status(404).json({message:"Resource not found"});
  }

  return res.status(200).json(updated);
 }catch(error){
  return res.status(500).json({message:"Error updating resource",error:error.message});
 }
};

export const deleteResource=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid resource id"});
  }

  const deleted=await Resource.findByIdAndDelete(id);

  if(!deleted){
   return res.status(404).json({message:"Resource not found"});
  }

  return res.status(200).json({message:"Resource deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Error deleting resource",error:error.message});
 }
};

export const toggleResourceStatus=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid resource id"});
  }

  const resource=await Resource.findById(id);

  if(!resource){
   return res.status(404).json({message:"Resource not found"});
  }

  resource.isActive=!resource.isActive;
  resource.updatedBy=req.user?req.user._id:null;

  await resource.save();

  const populated=await Resource.findById(resource._id)
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(200).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error updating resource status",error:error.message});
 }
};