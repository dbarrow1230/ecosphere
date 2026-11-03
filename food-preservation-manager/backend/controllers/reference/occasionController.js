import Occasion from "../../models/reference/occasionModel.js";
import Business from "../../models/reference/businessModel.js";
import Season from "../../models/reference/seasonsModel.js";

const populateOccasion=query=>query
 .populate({path:"business_id",model:Business})
 .populate({path:"seasonRef",model:Season});

export const createOccasion=async(req,res,next)=>{
 try{
  const occasion=await Occasion.create(req.body);
  const populatedOccasion=await populateOccasion(
   Occasion.findById(occasion._id)
  );
  res.status(201).json(populatedOccasion);
 }catch(error){
  next(error);
 }
};

export const getOccasions=async(req,res,next)=>{
 try{
  const filter={};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.seasonRef)filter.seasonRef=req.query.seasonRef;
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const occasions=await populateOccasion(
   Occasion.find(filter).sort({startDate:1,createdAt:-1})
  );

  res.status(200).json(occasions);
 }catch(error){
  next(error);
 }
};

export const getOccasionById=async(req,res,next)=>{
 try{
  const occasion=await populateOccasion(
   Occasion.findById(req.params.id)
  );

  if(!occasion)return res.status(404).json({message:"Occasion not found"});

  res.status(200).json(occasion);
 }catch(error){
  next(error);
 }
};

export const updateOccasion=async(req,res,next)=>{
 try{
  const updated=await Occasion.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Occasion not found"});

  const populatedOccasion=await populateOccasion(
   Occasion.findById(updated._id)
  );

  res.status(200).json(populatedOccasion);
 }catch(error){
  next(error);
 }
};

export const deleteOccasion=async(req,res,next)=>{
 try{
  const occasion=await Occasion.findByIdAndDelete(req.params.id);

  if(!occasion)return res.status(404).json({message:"Occasion not found"});

  res.status(200).json({message:"Occasion deleted successfully"});
 }catch(error){
  next(error);
 }
};
