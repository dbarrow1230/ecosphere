//backend/controllers/consulting/assessmentController.js
import mongoose from "mongoose";
import Assessment from "../../models/consulting/assessmentModel.js";

export const createAssessment=async(req,res)=>{
 try{
  const{
   project,
   title,
   assessmentDate,
   summary,
   strengths,
   weaknesses,
   findings,
   nextSteps,
   notes,
   isActive
  }=req.body;

  if(!project||!mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  const assessment=new Assessment({
   project,
   title,
   assessmentDate,
   summary,
   strengths:Array.isArray(strengths)?strengths:[],
   weaknesses:Array.isArray(weaknesses)?weaknesses:[],
   findings:Array.isArray(findings)?findings:[],
   nextSteps:Array.isArray(nextSteps)?nextSteps:[],
   notes,
   isActive:typeof isActive==="boolean"?isActive:true,
   createdBy:req.user?req.user._id:null,
   updatedBy:req.user?req.user._id:null
  });

  const savedAssessment=await assessment.save();
  const populatedAssessment=await Assessment.findById(savedAssessment._id)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(201).json(populatedAssessment);
 }catch(error){
  return res.status(500).json({message:"Error creating assessment",error:error.message});
 }
};

export const getAssessments=async(req,res)=>{
 try{
  const{project,isActive,area,status,priority,impact,search}=req.query;

  const filter={};

  if(project&&mongoose.Types.ObjectId.isValid(project)){
   filter.project=project;
  }
  if(typeof isActive!=="undefined"){
   filter.isActive=isActive==="true";
  }
  if(area){
   filter["findings.area"]=area;
  }
  if(status){
   filter["findings.status"]=status;
  }
  if(priority){
   filter["findings.priority"]=priority;
  }
  if(impact){
   filter["findings.impact"]=impact;
  }
  if(search){
   filter.$or=[
    {title:{$regex:search,$options:"i"}},
    {summary:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}},
    {"findings.title":{$regex:search,$options:"i"}},
    {"findings.finding":{$regex:search,$options:"i"}},
    {"findings.recommendation":{$regex:search,$options:"i"}}
   ];
  }

  const assessments=await Assessment.find(filter)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email")
   .sort({assessmentDate:-1,createdAt:-1});

  return res.status(200).json(assessments);
 }catch(error){
  return res.status(500).json({message:"Error fetching assessments",error:error.message});
 }
};

export const getAssessmentById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid assessment id"});
  }

  const assessment=await Assessment.findById(id)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!assessment){
   return res.status(404).json({message:"Assessment not found"});
  }

  return res.status(200).json(assessment);
 }catch(error){
  return res.status(500).json({message:"Error fetching assessment",error:error.message});
 }
};

export const updateAssessment=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid assessment id"});
  }

  const{
   project,
   title,
   assessmentDate,
   summary,
   strengths,
   weaknesses,
   findings,
   nextSteps,
   notes,
   isActive
  }=req.body;

  if(project&& !mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  const updateData={};

  if(typeof project!=="undefined")updateData.project=project;
  if(typeof title!=="undefined")updateData.title=title;
  if(typeof assessmentDate!=="undefined")updateData.assessmentDate=assessmentDate;
  if(typeof summary!=="undefined")updateData.summary=summary;
  if(typeof strengths!=="undefined")updateData.strengths=Array.isArray(strengths)?strengths:[];
  if(typeof weaknesses!=="undefined")updateData.weaknesses=Array.isArray(weaknesses)?weaknesses:[];
  if(typeof findings!=="undefined")updateData.findings=Array.isArray(findings)?findings:[];
  if(typeof nextSteps!=="undefined")updateData.nextSteps=Array.isArray(nextSteps)?nextSteps:[];
  if(typeof notes!=="undefined")updateData.notes=notes;
  if(typeof isActive!=="undefined")updateData.isActive=isActive;
  updateData.updatedBy=req.user?req.user._id:null;

  const updatedAssessment=await Assessment.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!updatedAssessment){
   return res.status(404).json({message:"Assessment not found"});
  }

  return res.status(200).json(updatedAssessment);
 }catch(error){
  return res.status(500).json({message:"Error updating assessment",error:error.message});
 }
};

export const deleteAssessment=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid assessment id"});
  }

  const deletedAssessment=await Assessment.findByIdAndDelete(id);

  if(!deletedAssessment){
   return res.status(404).json({message:"Assessment not found"});
  }

  return res.status(200).json({message:"Assessment deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Error deleting assessment",error:error.message});
 }
};

export const toggleAssessmentStatus=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid assessment id"});
  }

  const assessment=await Assessment.findById(id);

  if(!assessment){
   return res.status(404).json({message:"Assessment not found"});
  }

  assessment.isActive=!assessment.isActive;
  assessment.updatedBy=req.user?req.user._id:null;

  await assessment.save();

  const populatedAssessment=await Assessment.findById(assessment._id)
   .populate("project")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(200).json(populatedAssessment);
 }catch(error){
  return res.status(500).json({message:"Error updating assessment status",error:error.message});
 }
};