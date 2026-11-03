//backend/controllers/content/caseStudyController.js
import mongoose from "mongoose";
import CaseStudy from "../../models/content/caseStudyModel.js";

export const createCaseStudy=async(req,res)=>{
 try{
  const{
   project,
   clientBusiness,
   title,
   slug,
   summary,
   challenge,
   approach,
   solution,
   outcome,
   services,
   deliverables,
   metrics,
   featuredImage,
   gallery,
   publishedAt,
   isFeatured,
   isPublished,
   isActive,
   notes
  }=req.body;

  if(!title){
   return res.status(400).json({message:"Title is required"});
  }

  if(project&& !mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  if(clientBusiness&& !mongoose.Types.ObjectId.isValid(clientBusiness)){
   return res.status(400).json({message:"Valid clientBusiness is required"});
  }

  const caseStudy=new CaseStudy({
   project:project||null,
   clientBusiness:clientBusiness||null,
   title,
   slug,
   summary,
   challenge:Array.isArray(challenge)?challenge:[],
   approach:Array.isArray(approach)?approach:[],
   solution:Array.isArray(solution)?solution:[],
   outcome:Array.isArray(outcome)?outcome:[],
   services:Array.isArray(services)?services:[],
   deliverables:Array.isArray(deliverables)?deliverables:[],
   metrics:Array.isArray(metrics)?metrics:[],
   featuredImage,
   gallery:Array.isArray(gallery)?gallery:[],
   publishedAt,
   isFeatured:typeof isFeatured==="boolean"?isFeatured:false,
   isPublished:typeof isPublished==="boolean"?isPublished:false,
   isActive:typeof isActive==="boolean"?isActive:true,
   notes,
   createdBy:req.user?req.user._id:null,
   updatedBy:req.user?req.user._id:null
  });

  const saved=await caseStudy.save();

  const populated=await CaseStudy.findById(saved._id)
   .populate("project")
   .populate("clientBusiness")
   .populate("services")
   .populate("deliverables")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(201).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error creating case study",error:error.message});
 }
};

export const getCaseStudies=async(req,res)=>{
 try{
  const{project,clientBusiness,isFeatured,isPublished,isActive,search}=req.query;

  const filter={};

  if(project&&mongoose.Types.ObjectId.isValid(project)){
   filter.project=project;
  }
  if(clientBusiness&&mongoose.Types.ObjectId.isValid(clientBusiness)){
   filter.clientBusiness=clientBusiness;
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
    {summary:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}},
    {"metrics.label":{$regex:search,$options:"i"}},
    {"metrics.value":{$regex:search,$options:"i"}}
   ];
  }

  const caseStudies=await CaseStudy.find(filter)
   .populate("project")
   .populate("clientBusiness")
   .populate("services")
   .populate("deliverables")
   .populate("createdBy","name email")
   .populate("updatedBy","name email")
   .sort({createdAt:-1});

  return res.status(200).json(caseStudies);
 }catch(error){
  return res.status(500).json({message:"Error fetching case studies",error:error.message});
 }
};

export const getCaseStudyById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid case study id"});
  }

  const caseStudy=await CaseStudy.findById(id)
   .populate("project")
   .populate("clientBusiness")
   .populate("services")
   .populate("deliverables")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!caseStudy){
   return res.status(404).json({message:"Case study not found"});
  }

  return res.status(200).json(caseStudy);
 }catch(error){
  return res.status(500).json({message:"Error fetching case study",error:error.message});
 }
};

export const updateCaseStudy=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid case study id"});
  }

  const{
   project,
   clientBusiness,
   title,
   slug,
   summary,
   challenge,
   approach,
   solution,
   outcome,
   services,
   deliverables,
   metrics,
   featuredImage,
   gallery,
   publishedAt,
   isFeatured,
   isPublished,
   isActive,
   notes
  }=req.body;

  if(typeof project!=="undefined"&&project!==null&&project!==""&&!mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  if(typeof clientBusiness!=="undefined"&&clientBusiness!==null&&clientBusiness!==""&&!mongoose.Types.ObjectId.isValid(clientBusiness)){
   return res.status(400).json({message:"Valid clientBusiness is required"});
  }

  const updateData={};

  if(typeof project!=="undefined")updateData.project=project||null;
  if(typeof clientBusiness!=="undefined")updateData.clientBusiness=clientBusiness||null;
  if(typeof title!=="undefined")updateData.title=title;
  if(typeof slug!=="undefined")updateData.slug=slug;
  if(typeof summary!=="undefined")updateData.summary=summary;
  if(typeof challenge!=="undefined")updateData.challenge=Array.isArray(challenge)?challenge:[];
  if(typeof approach!=="undefined")updateData.approach=Array.isArray(approach)?approach:[];
  if(typeof solution!=="undefined")updateData.solution=Array.isArray(solution)?solution:[];
  if(typeof outcome!=="undefined")updateData.outcome=Array.isArray(outcome)?outcome:[];
  if(typeof services!=="undefined")updateData.services=Array.isArray(services)?services:[];
  if(typeof deliverables!=="undefined")updateData.deliverables=Array.isArray(deliverables)?deliverables:[];
  if(typeof metrics!=="undefined")updateData.metrics=Array.isArray(metrics)?metrics:[];
  if(typeof featuredImage!=="undefined")updateData.featuredImage=featuredImage;
  if(typeof gallery!=="undefined")updateData.gallery=Array.isArray(gallery)?gallery:[];
  if(typeof publishedAt!=="undefined")updateData.publishedAt=publishedAt;
  if(typeof isFeatured!=="undefined")updateData.isFeatured=isFeatured;
  if(typeof isPublished!=="undefined")updateData.isPublished=isPublished;
  if(typeof isActive!=="undefined")updateData.isActive=isActive;
  if(typeof notes!=="undefined")updateData.notes=notes;
  updateData.updatedBy=req.user?req.user._id:null;

  const updated=await CaseStudy.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("project")
   .populate("clientBusiness")
   .populate("services")
   .populate("deliverables")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!updated){
   return res.status(404).json({message:"Case study not found"});
  }

  return res.status(200).json(updated);
 }catch(error){
  return res.status(500).json({message:"Error updating case study",error:error.message});
 }
};

export const deleteCaseStudy=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid case study id"});
  }

  const deleted=await CaseStudy.findByIdAndDelete(id);

  if(!deleted){
   return res.status(404).json({message:"Case study not found"});
  }

  return res.status(200).json({message:"Case study deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Error deleting case study",error:error.message});
 }
};

export const toggleCaseStudyStatus=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid case study id"});
  }

  const caseStudy=await CaseStudy.findById(id);

  if(!caseStudy){
   return res.status(404).json({message:"Case study not found"});
  }

  caseStudy.isActive=!caseStudy.isActive;
  caseStudy.updatedBy=req.user?req.user._id:null;

  await caseStudy.save();

  const populated=await CaseStudy.findById(caseStudy._id)
   .populate("project")
   .populate("clientBusiness")
   .populate("services")
   .populate("deliverables")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(200).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error updating case study status",error:error.message});
 }
};