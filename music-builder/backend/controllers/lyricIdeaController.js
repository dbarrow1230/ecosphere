import LyricIdea from "../models/lyricIdeaModel.js";

const ownerFilter=req=>({_id:req.params.id,userId:req.user._id});

export const createLyricIdea=async(req,res,next)=>{try{res.status(201).json(await LyricIdea.create({...req.body,userId:req.user._id}));}catch(error){next(error);}};
export const getLyricIdeas=async(req,res,next)=>{try{const filter={userId:req.user._id};if(req.query.projectId)filter.projectIds=req.query.projectId;if(req.query.tag)filter.tags=req.query.tag;res.json(await LyricIdea.find(filter).sort({updatedAt:-1,createdAt:-1}));}catch(error){next(error);}};
export const getLyricIdeaById=async(req,res,next)=>{try{const record=await LyricIdea.findOne(ownerFilter(req));if(!record)return res.status(404).json({message:"Lyric idea not found"});res.json(record);}catch(error){next(error);}};
export const updateLyricIdea=async(req,res,next)=>{try{const changes={...req.body};delete changes.userId;const record=await LyricIdea.findOneAndUpdate(ownerFilter(req),changes,{returnDocument:"after",runValidators:true});if(!record)return res.status(404).json({message:"Lyric idea not found"});res.json(record);}catch(error){next(error);}};
export const deleteLyricIdea=async(req,res,next)=>{try{const record=await LyricIdea.findOneAndDelete(ownerFilter(req));if(!record)return res.status(404).json({message:"Lyric idea not found"});res.json({message:"Lyric idea deleted successfully"});}catch(error){next(error);}};
