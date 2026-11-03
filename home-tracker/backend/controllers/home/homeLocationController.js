import HomeLocation from "../../models/home/homeLocationModel.js";

const getBusinessFilter=req=>req.query?.business||req.body?.business||req.user?.business_id||req.user?.business||null;

export const createHomeLocation=async(req,res,next)=>{
 try{
  const business=getBusinessFilter(req);
  const {name,type="other",description="",isActive=true}=req.body;

  if(!name?.trim())return res.status(400).json({message:"Location name is required"});

  const location=await HomeLocation.create({
   business,
   name:name.trim(),
   type,
   description:description?.trim()||"",
   isActive
  });

  return res.status(201).json({location});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Location already exists"});
  return next(error);
 }
};

export const getHomeLocations=async(req,res,next)=>{
 try{
  const filter={};
  const business=getBusinessFilter(req);
  if(business)filter.business=business;
  if(req.query.type)filter.type=req.query.type;
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const locations=await HomeLocation.find(filter).sort({name:1}).lean();
  return res.json({locations});
 }catch(error){
  return next(error);
 }
};

export const getHomeLocationById=async(req,res,next)=>{
 try{
  const location=await HomeLocation.findById(req.params.id).lean();
  if(!location)return res.status(404).json({message:"Location not found"});
  return res.json(location);
 }catch(error){
  return next(error);
 }
};

export const updateHomeLocation=async(req,res,next)=>{
 try{
  const updates={};
  const allowed=["business","name","type","description","isActive"];
  allowed.forEach(field=>{
   if(req.body[field]!==undefined)updates[field]=typeof req.body[field]==="string"?req.body[field].trim():req.body[field];
  });

  if(updates.name!==undefined&&!updates.name)return res.status(400).json({message:"Location name is required"});

  const location=await HomeLocation.findByIdAndUpdate(req.params.id,updates,{new:true,runValidators:true});
  if(!location)return res.status(404).json({message:"Location not found"});
  return res.json({location});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Location already exists"});
  return next(error);
 }
};

export const deleteHomeLocation=async(req,res,next)=>{
 try{
  const location=await HomeLocation.findByIdAndDelete(req.params.id);
  if(!location)return res.status(404).json({message:"Location not found"});
  return res.json({message:"Location deleted successfully"});
 }catch(error){
  return next(error);
 }
};
