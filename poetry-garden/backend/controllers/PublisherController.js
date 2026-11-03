// backend/controllers/PublisherController.js
import mongoose from "mongoose";
import PublisherModel from "../models/PublisherModel.js";
import Country from "../models/locations/countryModel.js";
import State from "../models/locations/stateModel.js";

export const createPublisher=async(req,res)=>{
 try{
  const publisher=await PublisherModel.create(req.body);

  const populated=await PublisherModel.findById(publisher._id)
   .populate({path:"country",model:Country})
   .populate({path:"state",model:State});

  return res.status(201).json({success:true,message:"Publisher created successfully",publisher:populated});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create publisher",error:error.message});
 }
};

export const getPublishers=async(req,res)=>{
 try{
  const {search="",isActive,page=1,limit,sort="name",order="asc"}=req.query;

  const query={};

  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {imprint:{$regex:search,$options:"i"}},
    {city:{$regex:search,$options:"i"}},
    {contact:{$regex:search,$options:"i"}},
    {email:{$regex:search,$options:"i"}},
    {website:{$regex:search,$options:"i"}}
   ];
  }

  if(typeof isActive!=="undefined")query.isActive=isActive==="true";

  const currentPage=Math.max(parseInt(page)||1,1);
  const perPage=limit?Math.max(parseInt(limit)||1,1):0;
  const skip=perPage?(currentPage-1)*perPage:0;
  const sortOrder=order==="desc"?-1:1;

  const findQuery=PublisherModel.find(query)
   .populate({path:"country",model:Country})
   .populate({path:"state",model:State})
   .sort({[sort]:sortOrder});

  if(perPage){
   findQuery.skip(skip).limit(perPage);
  }

  const [publishers,total]=await Promise.all([
   findQuery,
   PublisherModel.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   total,
   page:currentPage,
   pages:perPage?Math.ceil(total/perPage):1,
   limit:perPage||total,
   publishers
  });
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch publishers",error:error.message});
 }
};

export const getPublisherById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid publisher id"});

  const publisher=await PublisherModel.findById(id)
   .populate({path:"country",model:Country})
   .populate({path:"state",model:State});

  if(!publisher)return res.status(404).json({success:false,message:"Publisher not found"});

  return res.status(200).json({success:true,publisher});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch publisher",error:error.message});
 }
};

export const updatePublisher=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid publisher id"});

  const publisher=await PublisherModel.findByIdAndUpdate(id,req.body,{returnDocument:"after",runValidators:true})
   .populate({path:"country",model:Country})
   .populate({path:"state",model:State});

  if(!publisher)return res.status(404).json({success:false,message:"Publisher not found"});

  return res.status(200).json({success:true,message:"Publisher updated successfully",publisher});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update publisher",error:error.message});
 }
};

export const deletePublisher=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid publisher id"});

  const publisher=await PublisherModel.findByIdAndDelete(id);

  if(!publisher)return res.status(404).json({success:false,message:"Publisher not found"});

  return res.status(200).json({success:true,message:"Publisher deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete publisher",error:error.message});
 }
};
