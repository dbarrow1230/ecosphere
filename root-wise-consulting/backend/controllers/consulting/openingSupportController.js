//backend/controllers/consulting/openingSupportController.js
import mongoose from "mongoose";
import OpeningSupport from "../../models/consulting/OpeningSupportModel.js";

export const createOpeningSupport=async(req,res)=>{
 try{
  const{
   project,
   title,
   openingDate,
   summary,
   tasks,
   risks,
   notes,
   status,
   isActive
  }=req.body;

  if(!project||!mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  const openingSupport=new OpeningSupport({
   project,
   title,
   openingDate,
   summary,
   tasks:Array.isArray(tasks)?tasks:[],
   risks:Array.isArray(risks)?risks:[],
   notes,
   status,
   isActive:typeof isActive==="boolean"?isActive:true,
   createdBy:req.user?req.user._id:null,
   updatedBy:req.user?req.user._id:null
  });

  const savedOpeningSupport=await openingSupport.save();
  const populatedOpeningSupport=await OpeningSupport.findById(savedOpeningSupport._id)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(201).json(populatedOpeningSupport);
 }catch(error){
  return res.status(500).json({message:"Error creating opening support",error:error.message});
 }
};

export const getOpeningSupports=async(req,res)=>{
 try{
  const{project,status,isActive,search}=req.query;

  const filter={};

  if(project&&mongoose.Types.ObjectId.isValid(project)){
   filter.project=project;
  }
  if(status){
   filter.status=status;
  }
  if(typeof isActive!=="undefined"){
   filter.isActive=isActive==="true";
  }
  if(search){
   filter.$or=[
    {title:{$regex:search,$options:"i"}},
    {summary:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}},
    {"tasks.task":{$regex:search,$options:"i"}},
    {"tasks.owner":{$regex:search,$options:"i"}},
    {"tasks.notes":{$regex:search,$options:"i"}},
    {risks:{$regex:search,$options:"i"}}
   ];
  }

  const openingSupports=await OpeningSupport.find(filter)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email")
   .sort({openingDate:-1,createdAt:-1});

  return res.status(200).json(openingSupports);
 }catch(error){
  return res.status(500).json({message:"Error fetching opening support records",error:error.message});
 }
};

export const getOpeningSupportById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid opening support id"});
  }

  const openingSupport=await OpeningSupport.findById(id)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!openingSupport){
   return res.status(404).json({message:"Opening support not found"});
  }

  return res.status(200).json(openingSupport);
 }catch(error){
  return res.status(500).json({message:"Error fetching opening support",error:error.message});
 }
};

export const updateOpeningSupport=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid opening support id"});
  }

  const{
   project,
   title,
   openingDate,
   summary,
   tasks,
   risks,
   notes,
   status,
   isActive
  }=req.body;

  if(project&& !mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  const updateData={};

  if(typeof project!=="undefined")updateData.project=project;
  if(typeof title!=="undefined")updateData.title=title;
  if(typeof openingDate!=="undefined")updateData.openingDate=openingDate;
  if(typeof summary!=="undefined")updateData.summary=summary;
  if(typeof tasks!=="undefined")updateData.tasks=Array.isArray(tasks)?tasks:[];
  if(typeof risks!=="undefined")updateData.risks=Array.isArray(risks)?risks:[];
  if(typeof notes!=="undefined")updateData.notes=notes;
  if(typeof status!=="undefined")updateData.status=status;
  if(typeof isActive!=="undefined")updateData.isActive=isActive;
  updateData.updatedBy=req.user?req.user._id:null;

  const updatedOpeningSupport=await OpeningSupport.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!updatedOpeningSupport){
   return res.status(404).json({message:"Opening support not found"});
  }

  return res.status(200).json(updatedOpeningSupport);
 }catch(error){
  return res.status(500).json({message:"Error updating opening support",error:error.message});
 }
};

export const deleteOpeningSupport=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid opening support id"});
  }

  const deletedOpeningSupport=await OpeningSupport.findByIdAndDelete(id);

  if(!deletedOpeningSupport){
   return res.status(404).json({message:"Opening support not found"});
  }

  return res.status(200).json({message:"Opening support deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Error deleting opening support",error:error.message});
 }
};

export const toggleOpeningSupportStatus=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid opening support id"});
  }

  const openingSupport=await OpeningSupport.findById(id);

  if(!openingSupport){
   return res.status(404).json({message:"Opening support not found"});
  }

  openingSupport.isActive=!openingSupport.isActive;
  openingSupport.updatedBy=req.user?req.user._id:null;

  await openingSupport.save();

  const populatedOpeningSupport=await OpeningSupport.findById(openingSupport._id)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(200).json(populatedOpeningSupport);
 }catch(error){
  return res.status(500).json({message:"Error updating opening support status",error:error.message});
 }
};