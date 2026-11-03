import ChordIdea from "../models/chordIdeaModel.js";

const ownerFilter=req=>({_id:req.params.id,userId:req.user._id});

export const createChordIdea=async(req,res,next)=>{try{res.status(201).json(await ChordIdea.create({...req.body,userId:req.user._id}));}catch(error){next(error);}};
export const getChordIdeas=async(req,res,next)=>{try{const filter={userId:req.user._id};if(req.query.key)filter.key=req.query.key;if(req.query.instrumentId)filter.instrumentId=req.query.instrumentId;if(req.query.projectId)filter.projectIds=req.query.projectId;if(req.query.tag)filter.tags=req.query.tag;res.json(await ChordIdea.find(filter).populate("instrumentId inversionId").sort({updatedAt:-1,createdAt:-1}));}catch(error){next(error);}};
export const getChordIdeaById=async(req,res,next)=>{try{const record=await ChordIdea.findOne(ownerFilter(req)).populate("instrumentId inversionId");if(!record)return res.status(404).json({message:"Chord idea not found"});res.json(record);}catch(error){next(error);}};
export const updateChordIdea=async(req,res,next)=>{try{const changes={...req.body};delete changes.userId;const record=await ChordIdea.findOneAndUpdate(ownerFilter(req),changes,{returnDocument:"after",runValidators:true});if(!record)return res.status(404).json({message:"Chord idea not found"});res.json(record);}catch(error){next(error);}};
export const deleteChordIdea=async(req,res,next)=>{try{const record=await ChordIdea.findOneAndDelete(ownerFilter(req));if(!record)return res.status(404).json({message:"Chord idea not found"});res.json({message:"Chord idea deleted successfully"});}catch(error){next(error);}};
