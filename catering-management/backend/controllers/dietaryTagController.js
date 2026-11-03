import DietaryTag from "../models/dietaryTagModel.js";

export const getDietaryTags=async(req,res)=>{
 try{
  const tags=await DietaryTag.find();
  res.json({success:true,data:tags});
 }catch(err){
  res.status(500).json({success:false,message:err.message});
 }
};

export const getDietaryTagById=async(req,res)=>{
 try{
  const tag=await DietaryTag.findById(req.params.id);
  if(!tag){return res.status(404).json({success:false,message:"Dietary tag not found"});}
  res.json({success:true,data:tag});
 }catch(err){
  res.status(500).json({success:false,message:err.message});
 }
};

export const createDietaryTag=async(req,res)=>{
 try{
  const tag=new DietaryTag(req.body);
  const saved=await tag.save();
  res.status(201).json({success:true,data:saved});
 }catch(err){
  res.status(400).json({success:false,message:err.message});
 }
};

export const updateDietaryTag=async(req,res)=>{
 try{
  const tag=await DietaryTag.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!tag){return res.status(404).json({success:false,message:"Dietary tag not found"});}
  res.json({success:true,data:tag});
 }catch(err){
  res.status(400).json({success:false,message:err.message});
 }
};

export const deleteDietaryTag=async(req,res)=>{
 try{
  const tag=await DietaryTag.findByIdAndDelete(req.params.id);
  if(!tag){return res.status(404).json({success:false,message:"Dietary tag not found"});}
  res.json({success:true,message:"Dietary tag deleted"});
 }catch(err){
  res.status(500).json({success:false,message:err.message});
 }
};