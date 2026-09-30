// backend/controllers/LanguageController.js
import LanguageModel from "../models/LanguageModel.js";
import mongoose from "mongoose";

export const createLanguage=async(req,res)=>{
 try{
  const language=await LanguageModel.create({
   name:req.body.name
  });
  return res.status(201).json({success:true,message:"Language created successfully",language});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Language already exists"});
  return res.status(500).json({success:false,message:"Failed to create language",error:error.message});
 }
};

export const getLanguages=async(req,res)=>{
 try{
  const {search=""}=req.query;

  const query={};

  if(search){
   query.name={$regex:search,$options:"i"};
  }

  const languages=await LanguageModel.find(query).sort({name:1});

  return res.status(200).json({success:true,languages});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch languages",error:error.message});
 }
};

export const getLanguageById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid language id"});

  const language=await LanguageModel.findById(id);

  if(!language)return res.status(404).json({success:false,message:"Language not found"});

  return res.status(200).json({success:true,language});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch language",error:error.message});
 }
};

export const updateLanguage=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid language id"});

  const language=await LanguageModel.findByIdAndUpdate(id,{
   name:req.body.name
  },{new:true,runValidators:true});

  if(!language)return res.status(404).json({success:false,message:"Language not found"});

  return res.status(200).json({success:true,message:"Language updated successfully",language});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Language already exists"});
  return res.status(500).json({success:false,message:"Failed to update language",error:error.message});
 }
};

export const deleteLanguage=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid language id"});

  const language=await LanguageModel.findByIdAndDelete(id);

  if(!language)return res.status(404).json({success:false,message:"Language not found"});

  return res.status(200).json({success:true,message:"Language deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete language",error:error.message});
 }
};