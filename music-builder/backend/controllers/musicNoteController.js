import MusicNote from "../models/musicNoteModel.js";

const ownerFilter=req=>({_id:req.params.id,userId:req.user._id});

export const createMusicNote=async(req,res,next)=>{try{res.status(201).json(await MusicNote.create({...req.body,userId:req.user._id}));}catch(error){next(error);}};
export const getMusicNotes=async(req,res,next)=>{try{const filter={userId:req.user._id};if(req.query.projectId)filter.projectIds=req.query.projectId;if(req.query.tag)filter.tags=req.query.tag;res.json(await MusicNote.find(filter).sort({updatedAt:-1,createdAt:-1}));}catch(error){next(error);}};
export const getMusicNoteById=async(req,res,next)=>{try{const record=await MusicNote.findOne(ownerFilter(req));if(!record)return res.status(404).json({message:"Music note not found"});res.json(record);}catch(error){next(error);}};
export const updateMusicNote=async(req,res,next)=>{try{const changes={...req.body};delete changes.userId;const record=await MusicNote.findOneAndUpdate(ownerFilter(req),changes,{returnDocument:"after",runValidators:true});if(!record)return res.status(404).json({message:"Music note not found"});res.json(record);}catch(error){next(error);}};
export const deleteMusicNote=async(req,res,next)=>{try{const record=await MusicNote.findOneAndDelete(ownerFilter(req));if(!record)return res.status(404).json({message:"Music note not found"});res.json({message:"Music note deleted successfully"});}catch(error){next(error);}};
