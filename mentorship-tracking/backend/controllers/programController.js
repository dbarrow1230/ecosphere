// backend/controllers/programController.js
import mongoose from "mongoose";
import Program from "../models/programModel.js";

export const createProgram=async(req,res)=>{
 try{
  const {programType,category,courseName,courses,requiredHours,externshipHours,notes,createdBy}=req.body;

  if(!programType||!category||!courseName||!createdBy){
   return res.status(400).json({message:"programType, category, courseName, and createdBy are required"});
  }

  if(!mongoose.Types.ObjectId.isValid(createdBy)){
   return res.status(400).json({message:"Invalid createdBy id"});
  }

  const program=await Program.create({
   programType,
   category,
   courseName,
   courses:Array.isArray(courses)?courses:[],
   requiredHours:requiredHours??150,
   externshipHours:externshipHours??150,
   notes,
   createdBy
  });

  const populatedProgram=await Program.findById(program._id)
   .populate("createdBy");

  res.status(201).json(populatedProgram);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getPrograms=async(req,res)=>{
 try{
  const {programType,category}=req.query;
  const query={};

  if(programType){
   query.programType=programType;
  }

  if(category){
   query.category=category;
  }

  const programs=await Program.find(query)
   .populate("createdBy")
   .sort({createdAt:-1});

  res.status(200).json(programs);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getProgramById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid program id"});
  }

  const program=await Program.findById(id)
   .populate("createdBy");

  if(!program){
   return res.status(404).json({message:"Program not found"});
  }

  res.status(200).json(program);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const updateProgram=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid program id"});
  }

  const existingProgram=await Program.findById(id);
  if(!existingProgram){
   return res.status(404).json({message:"Program not found"});
  }

  if(req.body.createdBy&&!mongoose.Types.ObjectId.isValid(req.body.createdBy)){
   return res.status(400).json({message:"Invalid createdBy id"});
  }

  const updateData={
   ...req.body,
   ...(req.body.courses?{courses:Array.isArray(req.body.courses)?req.body.courses:[]}:{}),
   requiredHours:req.body.requiredHours??existingProgram.requiredHours,
   externshipHours:req.body.externshipHours??existingProgram.externshipHours
  };

  const program=await Program.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("createdBy");

  res.status(200).json(program);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const deleteProgram=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid program id"});
  }

  const program=await Program.findByIdAndDelete(id);

  if(!program){
   return res.status(404).json({message:"Program not found"});
  }

  res.status(200).json({message:"Program deleted successfully"});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};