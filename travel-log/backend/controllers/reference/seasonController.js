// backend/controllers/reference/seasonController.js
import Season from "../../models/reference/seasonsModel.js";

export const createSeason=async(req,res,next)=>{
 try{
  const season=await Season.create(req.body);
  res.status(201).json(season);
 }catch(error){
  next(error);
 }
};

export const getSeasons=async(req,res,next)=>{
 try{
  const filter={};

  if(req.query.isDefault!==undefined)filter.isDefault=req.query.isDefault==="true";
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const seasons=await Season.find(filter).sort({startDate:1,createdAt:-1});

  res.status(200).json(seasons);
 }catch(error){
  next(error);
 }
};

export const getSeasonById=async(req,res,next)=>{
 try{
  const season=await Season.findById(req.params.id);

  if(!season)return res.status(404).json({message:"Season not found"});

  res.status(200).json(season);
 }catch(error){
  next(error);
 }
};

export const updateSeason=async(req,res,next)=>{
 try{
  const updated=await Season.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Season not found"});

  res.status(200).json(updated);
 }catch(error){
  next(error);
 }
};

export const deleteSeason=async(req,res,next)=>{
 try{
  const season=await Season.findByIdAndDelete(req.params.id);

  if(!season)return res.status(404).json({message:"Season not found"});

  res.status(200).json({message:"Season deleted successfully"});
 }catch(error){
  next(error);
 }
};