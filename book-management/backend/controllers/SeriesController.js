// backend/controllers/SeriesController.js
import SeriesModel from "../models/SeriesModel.js";
import mongoose from "mongoose";

export const createSeries=async(req,res)=>{
 try{
  const series=await SeriesModel.create(req.body);
  return res.status(201).json({success:true,message:"Series created successfully",series});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create series",error:error.message});
 }
};

export const getSeries=async(req,res)=>{
 try{
  const {search="",page=1,limit=20,sort="name",order="asc"}=req.query;

  const query={};

  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}}
   ];
  }

  const currentPage=Math.max(parseInt(page)||1,1);
  const perPage=Math.max(parseInt(limit)||20,1);
  const skip=(currentPage-1)*perPage;
  const sortOrder=order==="desc"?-1:1;

  const [series,total]=await Promise.all([
   SeriesModel.find(query).sort({[sort]:sortOrder}).skip(skip).limit(perPage),
   SeriesModel.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   total,
   page:currentPage,
   pages:Math.ceil(total/perPage),
   limit:perPage,
   series
  });
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch series",error:error.message});
 }
};

export const getSeriesById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid series id"});

  const series=await SeriesModel.findById(id);

  if(!series)return res.status(404).json({success:false,message:"Series not found"});

  return res.status(200).json({success:true,series});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch series",error:error.message});
 }
};

export const updateSeries=async(req,res)=>{
 try{
  const {id}=req.params;

  const series=await SeriesModel.findByIdAndUpdate(id,req.body,{new:true,runValidators:true});

  if(!series)return res.status(404).json({success:false,message:"Series not found"});

  return res.status(200).json({success:true,message:"Series updated successfully",series});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update series",error:error.message});
 }
};

export const deleteSeries=async(req,res)=>{
 try{
  const {id}=req.params;

  const series=await SeriesModel.findByIdAndDelete(id);

  if(!series)return res.status(404).json({success:false,message:"Series not found"});

  return res.status(200).json({success:true,message:"Series deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete series",error:error.message});
 }
};