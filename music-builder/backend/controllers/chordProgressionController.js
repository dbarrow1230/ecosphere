import ChordProgression from "../models/chordProgressionModel.js";

const ownerFilter=req=>({_id:req.params.id,userId:req.user._id});

export const createChordProgression=async(req,res,next)=>{try{res.status(201).json(await ChordProgression.create({...req.body,userId:req.user._id}));}catch(error){next(error);}};
export const getChordProgressions=async(req,res,next)=>{try{const filter={userId:req.user._id};if(req.query.key)filter.key=req.query.key;if(req.query.mode)filter.mode=req.query.mode;if(req.query.projectId)filter.projectIds=req.query.projectId;if(req.query.tag)filter.tags=req.query.tag;res.json(await ChordProgression.find(filter).sort({updatedAt:-1,createdAt:-1}));}catch(error){next(error);}};
export const getChordProgressionById=async(req,res,next)=>{try{const record=await ChordProgression.findOne(ownerFilter(req));if(!record)return res.status(404).json({message:"Chord progression not found"});res.json(record);}catch(error){next(error);}};
export const updateChordProgression=async(req,res,next)=>{try{const changes={...req.body};delete changes.userId;const record=await ChordProgression.findOneAndUpdate(ownerFilter(req),changes,{returnDocument:"after",runValidators:true});if(!record)return res.status(404).json({message:"Chord progression not found"});res.json(record);}catch(error){next(error);}};
export const deleteChordProgression=async(req,res,next)=>{try{const record=await ChordProgression.findOneAndDelete(ownerFilter(req));if(!record)return res.status(404).json({message:"Chord progression not found"});res.json({message:"Chord progression deleted successfully"});}catch(error){next(error);}};
