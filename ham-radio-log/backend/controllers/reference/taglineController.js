import Tagline from "../../models/reference/taglineModel.js";
import Business from "../../models/reference/businessModel.js";
import Season from "../../models/reference/seasonsModel.js";
import Occasion from "../../models/reference/occasionModel.js";

const populateTagline=query=>query
 .populate({path:"business_id",model:Business})
 .populate({path:"seasonRef",model:Season})
 .populate({path:"occasionRef",model:Occasion});

export const createTagline=async(req,res,next)=>{
 try{
  const tagline=await Tagline.create(req.body);
  const populatedTagline=await populateTagline(
   Tagline.findById(tagline._id)
  );
  res.status(201).json(populatedTagline);
 }catch(error){
  next(error);
 }
};

export const getTaglines=async(req,res,next)=>{
 try{
  const filter={};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.seasonRef)filter.seasonRef=req.query.seasonRef;
  if(req.query.occasionRef)filter.occasionRef=req.query.occasionRef;
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const taglines=await populateTagline(
   Tagline.find(filter).sort({createdAt:-1})
  );

  res.status(200).json(taglines);
 }catch(error){
  next(error);
 }
};

export const getTaglineById=async(req,res,next)=>{
 try{
  const tagline=await populateTagline(
   Tagline.findById(req.params.id)
  );

  if(!tagline)return res.status(404).json({message:"Tagline not found"});

  res.status(200).json(tagline);
 }catch(error){
  next(error);
 }
};

export const updateTagline=async(req,res,next)=>{
 try{
  const updated=await Tagline.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Tagline not found"});

  const populatedTagline=await populateTagline(
   Tagline.findById(updated._id)
  );

  res.status(200).json(populatedTagline);
 }catch(error){
  next(error);
 }
};

export const deleteTagline=async(req,res,next)=>{
 try{
  const tagline=await Tagline.findByIdAndDelete(req.params.id);

  if(!tagline)return res.status(404).json({message:"Tagline not found"});

  res.status(200).json({message:"Tagline deleted successfully"});
 }catch(error){
  next(error);
 }
};