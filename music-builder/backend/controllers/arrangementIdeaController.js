import ArrangementIdea from "../models/arrangementIdeaModel.js";

const ownerFilter=req=>({_id:req.params.id,userId:req.user._id});

export const createArrangementIdea=async(req,res,next)=>{try{res.status(201).json(await ArrangementIdea.create({...req.body,userId:req.user._id}));}catch(error){next(error);}};
export const getArrangementIdeas=async(req,res,next)=>{try{const filter={userId:req.user._id};if(req.query.projectId)filter.projectIds=req.query.projectId;if(req.query.tag)filter.tags=req.query.tag;res.json(await ArrangementIdea.find(filter).sort({updatedAt:-1,createdAt:-1}));}catch(error){next(error);}};
export const getArrangementIdeaById=async(req,res,next)=>{try{const record=await ArrangementIdea.findOne(ownerFilter(req));if(!record)return res.status(404).json({message:"Arrangement idea not found"});res.json(record);}catch(error){next(error);}};
export const updateArrangementIdea=async(req,res,next)=>{try{const changes={...req.body};delete changes.userId;const record=await ArrangementIdea.findOneAndUpdate(ownerFilter(req),changes,{returnDocument:"after",runValidators:true});if(!record)return res.status(404).json({message:"Arrangement idea not found"});res.json(record);}catch(error){next(error);}};
export const deleteArrangementIdea=async(req,res,next)=>{try{const record=await ArrangementIdea.findOneAndDelete(ownerFilter(req));if(!record)return res.status(404).json({message:"Arrangement idea not found"});res.json({message:"Arrangement idea deleted successfully"});}catch(error){next(error);}};
