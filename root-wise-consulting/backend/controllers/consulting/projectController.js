//backend/controllers/consulting/projectController.js
import mongoose from "mongoose";
import Project from "../../models/consulting/projectModel.js";

export const createProject=async(req,res)=>{
 try{
  const{
   clientBusiness,
   businessProfile,
   name,
   code,
   projectType,
   stage,
   priority,
   services,
   problemSummary,
   scopeSummary,
   goals,
   successMeasures,
   startDate,
   targetDate,
   endDate,
   budget,
   estimatedValue,
   clientSummary,
   internalNotes,
   isActive
  }=req.body;

  if(!clientBusiness||!mongoose.Types.ObjectId.isValid(clientBusiness)){
   return res.status(400).json({message:"Valid clientBusiness is required"});
  }

  if(businessProfile&& !mongoose.Types.ObjectId.isValid(businessProfile)){
   return res.status(400).json({message:"Valid businessProfile is required"});
  }

  if(!name){
   return res.status(400).json({message:"Project name is required"});
  }

  const project=new Project({
   clientBusiness,
   businessProfile:businessProfile||null,
   name,
   code,
   projectType,
   stage,
   priority,
   services:Array.isArray(services)?services:[],
   problemSummary,
   scopeSummary,
   goals:Array.isArray(goals)?goals:[],
   successMeasures:Array.isArray(successMeasures)?successMeasures:[],
   startDate,
   targetDate,
   endDate,
   budget,
   estimatedValue,
   clientSummary,
   internalNotes,
   isActive:typeof isActive==="boolean"?isActive:true,
   createdBy:req.user?req.user._id:null,
   updatedBy:req.user?req.user._id:null
  });

  const saved=await project.save();

  const populated=await Project.findById(saved._id)
   .populate("clientBusiness")
   .populate("businessProfile")
   .populate("services")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(201).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error creating project",error:error.message});
 }
};

export const getProjects=async(req,res)=>{
 try{
  const{clientBusiness,projectType,stage,priority,isActive,search}=req.query;

  const filter={};

  if(clientBusiness&&mongoose.Types.ObjectId.isValid(clientBusiness)){
   filter.clientBusiness=clientBusiness;
  }
  if(projectType){
   filter.projectType=projectType;
  }
  if(stage){
   filter.stage=stage;
  }
  if(priority){
   filter.priority=priority;
  }
  if(typeof isActive!=="undefined"){
   filter.isActive=isActive==="true";
  }
  if(search){
   filter.$or=[
    {name:{$regex:search,$options:"i"}},
    {code:{$regex:search,$options:"i"}},
    {problemSummary:{$regex:search,$options:"i"}},
    {scopeSummary:{$regex:search,$options:"i"}},
    {clientSummary:{$regex:search,$options:"i"}},
    {internalNotes:{$regex:search,$options:"i"}}
   ];
  }

  const projects=await Project.find(filter)
   .populate("clientBusiness")
   .populate("businessProfile")
   .populate("services")
   .populate("createdBy","name email")
   .populate("updatedBy","name email")
   .sort({createdAt:-1});

  return res.status(200).json(projects);
 }catch(error){
  return res.status(500).json({message:"Error fetching projects",error:error.message});
 }
};

export const getProjectById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid project id"});
  }

  const project=await Project.findById(id)
   .populate("clientBusiness")
   .populate("businessProfile")
   .populate("services")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!project){
   return res.status(404).json({message:"Project not found"});
  }

  return res.status(200).json(project);
 }catch(error){
  return res.status(500).json({message:"Error fetching project",error:error.message});
 }
};

export const updateProject=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid project id"});
  }

  const{
   clientBusiness,
   businessProfile,
   name,
   code,
   projectType,
   stage,
   priority,
   services,
   problemSummary,
   scopeSummary,
   goals,
   successMeasures,
   startDate,
   targetDate,
   endDate,
   budget,
   estimatedValue,
   clientSummary,
   internalNotes,
   isActive
  }=req.body;

  if(clientBusiness&& !mongoose.Types.ObjectId.isValid(clientBusiness)){
   return res.status(400).json({message:"Valid clientBusiness is required"});
  }

  if(typeof businessProfile!=="undefined"&&businessProfile!==null&&businessProfile!==""&&!mongoose.Types.ObjectId.isValid(businessProfile)){
   return res.status(400).json({message:"Valid businessProfile is required"});
  }

  const updateData={};

  if(typeof clientBusiness!=="undefined")updateData.clientBusiness=clientBusiness;
  if(typeof businessProfile!=="undefined")updateData.businessProfile=businessProfile||null;
  if(typeof name!=="undefined")updateData.name=name;
  if(typeof code!=="undefined")updateData.code=code;
  if(typeof projectType!=="undefined")updateData.projectType=projectType;
  if(typeof stage!=="undefined")updateData.stage=stage;
  if(typeof priority!=="undefined")updateData.priority=priority;
  if(typeof services!=="undefined")updateData.services=Array.isArray(services)?services:[];
  if(typeof problemSummary!=="undefined")updateData.problemSummary=problemSummary;
  if(typeof scopeSummary!=="undefined")updateData.scopeSummary=scopeSummary;
  if(typeof goals!=="undefined")updateData.goals=Array.isArray(goals)?goals:[];
  if(typeof successMeasures!=="undefined")updateData.successMeasures=Array.isArray(successMeasures)?successMeasures:[];
  if(typeof startDate!=="undefined")updateData.startDate=startDate;
  if(typeof targetDate!=="undefined")updateData.targetDate=targetDate;
  if(typeof endDate!=="undefined")updateData.endDate=endDate;
  if(typeof budget!=="undefined")updateData.budget=budget;
  if(typeof estimatedValue!=="undefined")updateData.estimatedValue=estimatedValue;
  if(typeof clientSummary!=="undefined")updateData.clientSummary=clientSummary;
  if(typeof internalNotes!=="undefined")updateData.internalNotes=internalNotes;
  if(typeof isActive!=="undefined")updateData.isActive=isActive;

  updateData.updatedBy=req.user?req.user._id:null;

  const updated=await Project.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("clientBusiness")
   .populate("businessProfile")
   .populate("services")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!updated){
   return res.status(404).json({message:"Project not found"});
  }

  return res.status(200).json(updated);
 }catch(error){
  return res.status(500).json({message:"Error updating project",error:error.message});
 }
};

export const deleteProject=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid project id"});
  }

  const deleted=await Project.findByIdAndDelete(id);

  if(!deleted){
   return res.status(404).json({message:"Project not found"});
  }

  return res.status(200).json({message:"Project deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Error deleting project",error:error.message});
 }
};

export const toggleProjectStatus=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid project id"});
  }

  const project=await Project.findById(id);

  if(!project){
   return res.status(404).json({message:"Project not found"});
  }

  project.isActive=!project.isActive;
  project.updatedBy=req.user?req.user._id:null;

  await project.save();

  const populated=await Project.findById(project._id)
   .populate("clientBusiness")
   .populate("businessProfile")
   .populate("services")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(200).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error updating project status",error:error.message});
 }
};