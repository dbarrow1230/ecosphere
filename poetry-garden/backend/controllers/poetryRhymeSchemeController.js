// backend/controllers/poetryRhymeSchemeController.js
import PoetryRhymeScheme from "../models/PoetryRhymeScheme.js";

export const getPoetryRhymeSchemes=async(req,res)=>{
 try{
  const rhymeSchemes=await PoetryRhymeScheme.find().sort({name:1});
  res.json(rhymeSchemes);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getPoetryRhymeScheme=async(req,res)=>{
 try{
  const rhymeScheme=await PoetryRhymeScheme.findById(req.params.id);

  if(!rhymeScheme){
   return res.status(404).json({message:"Poetry rhyme scheme not found"});
  }

  res.json(rhymeScheme);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const createPoetryRhymeScheme=async(req,res)=>{
 try{
  const rhymeScheme=await PoetryRhymeScheme.create(req.body);
  res.status(201).json(rhymeScheme);
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({message:"Poetry rhyme scheme already exists"});
  }

  res.status(400).json({message:error.message});
 }
};

export const updatePoetryRhymeScheme=async(req,res)=>{
 try{
  const rhymeScheme=await PoetryRhymeScheme.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!rhymeScheme){
   return res.status(404).json({message:"Poetry rhyme scheme not found"});
  }

  res.json(rhymeScheme);
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({message:"Poetry rhyme scheme already exists"});
  }

  res.status(400).json({message:error.message});
 }
};

export const deletePoetryRhymeScheme=async(req,res)=>{
 try{
  const rhymeScheme=await PoetryRhymeScheme.findByIdAndDelete(req.params.id);

  if(!rhymeScheme){
   return res.status(404).json({message:"Poetry rhyme scheme not found"});
  }

  res.json({message:"Poetry rhyme scheme deleted"});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};