import MusicProject from "../models/musicProjectModel.js";

const ownerFilter=req=>({_id:req.params.id,userId:req.user._id});

export const createMusicProject=async(req,res,next)=>{try{res.status(201).json(await MusicProject.create({...req.body,userId:req.user._id}));}catch(error){next(error);}};
export const getMusicProjects=async(req,res,next)=>{try{const filter={userId:req.user._id};if(req.query.status)filter.status=req.query.status;if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";if(req.query.tag)filter.tags=req.query.tag;res.json(await MusicProject.find(filter).sort({updatedAt:-1,createdAt:-1}));}catch(error){next(error);}};
export const getMusicProjectById=async(req,res,next)=>{try{const record=await MusicProject.findOne(ownerFilter(req));if(!record)return res.status(404).json({message:"Music project not found"});res.json(record);}catch(error){next(error);}};
export const updateMusicProject=async(req,res,next)=>{try{const changes={...req.body};delete changes.userId;const record=await MusicProject.findOneAndUpdate(ownerFilter(req),changes,{returnDocument:"after",runValidators:true});if(!record)return res.status(404).json({message:"Music project not found"});res.json(record);}catch(error){next(error);}};
export const deleteMusicProject=async(req,res,next)=>{try{const record=await MusicProject.findOneAndDelete(ownerFilter(req));if(!record)return res.status(404).json({message:"Music project not found"});res.json({message:"Music project deleted successfully"});}catch(error){next(error);}};
