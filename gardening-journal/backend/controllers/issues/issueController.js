import mongoose from "mongoose";
import Issue from "../../models/issues/issueModel.js";

const populateIssue=query=>query
 .populate("seed","plantName")
 .populate("plant","name commonName botanicalName")
 .populate("planting","name status plantedDate deathDate")
 .populate("garden","name")
 .populate("notes.createdBy","username name email")
 .populate("createdBy","username name email");

const cleanObjectId=value=>{
 if(!value)return null;
 if(typeof value==="string")return mongoose.Types.ObjectId.isValid(value)?value:null;
 if(typeof value==="object"){
  if(typeof value._id==="string")return mongoose.Types.ObjectId.isValid(value._id)?value._id:null;
  if(typeof value.id==="string")return mongoose.Types.ObjectId.isValid(value.id)?value.id:null;
 }
 return null;
};

const cleanString=value=>value===undefined||value===null?"":String(value).trim();

const cleanIssuePayload=(body={},reqUser={})=>({
 title:cleanString(body.title),
 issueType:cleanString(body.issueType),
 severity:cleanString(body.severity),
 status:cleanString(body.status)||"open",
 sourceType:cleanString(body.sourceType),
 seed:cleanObjectId(body.seed),
 plant:cleanObjectId(body.plant),
 planting:cleanObjectId(body.planting),
 garden:cleanObjectId(body.garden),
 observedAt:body.observedAt||null,
 resolvedAt:body.resolvedAt||null,
 description:cleanString(body.description),
 actionTaken:cleanString(body.actionTaken),
 notes:Array.isArray(body.notes)?body.notes:[],
 createdBy:cleanObjectId(body.createdBy)||cleanObjectId(reqUser?._id)||cleanObjectId(reqUser?.id),
 isActive:body.isActive!==undefined?!!body.isActive:true
});

export const createIssue=async(req,res)=>{
 try{
  const payload=cleanIssuePayload(req.body,req.user);

  if(!payload.title){
   return res.status(400).json({message:"title is required"});
  }

  const issue=await Issue.create(payload);
  const populated=await populateIssue(Issue.findById(issue._id));

  return res.status(201).json(populated);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getIssues=async(req,res)=>{
 try{
  const query={};

  if(req.query.status)query.status=req.query.status;
  if(req.query.issueType)query.issueType=req.query.issueType;
  if(req.query.severity)query.severity=req.query.severity;
  if(req.query.createdBy)query.createdBy=req.query.createdBy;
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

  if(req.query.search){
   query.$or=[
    {title:{$regex:req.query.search,$options:"i"}},
    {description:{$regex:req.query.search,$options:"i"}},
    {actionTaken:{$regex:req.query.search,$options:"i"}}
   ];
  }

  const issues=await populateIssue(Issue.find(query)).sort({observedAt:-1,createdAt:-1});

  return res.status(200).json(issues);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getIssueById=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({message:"Invalid issue id"});
  }

  const issue=await populateIssue(Issue.findById(req.params.id));

  if(!issue){
   return res.status(404).json({message:"Issue not found"});
  }

  return res.status(200).json(issue);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateIssue=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({message:"Invalid issue id"});
  }

  const issue=await Issue.findById(req.params.id);

  if(!issue){
   return res.status(404).json({message:"Issue not found"});
  }

  const payload=cleanIssuePayload(req.body,req.user);
  Object.keys(payload).forEach(key=>{
   if(req.body[key]!==undefined)issue[key]=payload[key];
  });

  if(!issue.title){
   return res.status(400).json({message:"title is required"});
  }

  const updated=await issue.save();
  const populated=await populateIssue(Issue.findById(updated._id));

  return res.status(200).json(populated);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteIssue=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({message:"Invalid issue id"});
  }

  const issue=await Issue.findByIdAndDelete(req.params.id);

  if(!issue){
   return res.status(404).json({message:"Issue not found"});
  }

  return res.status(200).json({message:"Issue deleted successfully"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};