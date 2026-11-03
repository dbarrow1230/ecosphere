// backend/controllers/reference/seasonController.js
import Season from "../../models/reference/seasonsModel.js";
import Business from "../../models/reference/businessModel.js";

const populateSeason=query=>query
 .populate({path:"business_id",model:Business});

const normalizeSeasonPayload=payload=>({
 ...payload,
 business_id:payload.business_id||null,
 code:payload.code||undefined
});

export const createSeason=async(req,res,next)=>{
 try{
  const season=await Season.create(normalizeSeasonPayload(req.body));
  const populatedSeason=await populateSeason(Season.findById(season._id));

  res.status(201).json(populatedSeason);
 }catch(error){
  next(error);
 }
};

export const getSeasons=async(req,res,next)=>{
 try{
  const filter={};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.isDefault!==undefined)filter.isDefault=req.query.isDefault==="true";
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const seasons=await populateSeason(
   Season.find(filter).sort({startDate:1,createdAt:-1})
  );

  res.status(200).json(seasons);
 }catch(error){
  next(error);
 }
};

export const getSeasonById=async(req,res,next)=>{
 try{
  const season=await populateSeason(Season.findById(req.params.id));

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
   normalizeSeasonPayload(req.body),
   {new:true,runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Season not found"});

  const populatedSeason=await populateSeason(Season.findById(updated._id));

  res.status(200).json(populatedSeason);
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
