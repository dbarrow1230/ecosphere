import HomeCategory from "../../models/home/homeCategoryModel.js";

const getBusinessFilter=req=>req.query?.business||req.body?.business||req.user?.business_id||req.user?.business||null;

export const createHomeCategory=async(req,res,next)=>{
 try{
  const business=getBusinessFilter(req);
  const {name,type="all",description="",isActive=true}=req.body;

  if(!name?.trim())return res.status(400).json({message:"Category name is required"});

  const category=await HomeCategory.create({
   business,
   name:name.trim(),
   type,
   description:description?.trim()||"",
   isActive
  });

  return res.status(201).json({category});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Category already exists"});
  return next(error);
 }
};

export const getHomeCategories=async(req,res,next)=>{
 try{
  const filter={};
  const business=getBusinessFilter(req);
  if(business)filter.business=business;
  if(req.query.type&&req.query.type!=="all")filter.type={$in:["all",req.query.type]};
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const categories=await HomeCategory.find(filter).sort({name:1}).lean();
  return res.json({categories});
 }catch(error){
  return next(error);
 }
};

export const getHomeCategoryById=async(req,res,next)=>{
 try{
  const category=await HomeCategory.findById(req.params.id).lean();
  if(!category)return res.status(404).json({message:"Category not found"});
  return res.json(category);
 }catch(error){
  return next(error);
 }
};

export const updateHomeCategory=async(req,res,next)=>{
 try{
  const updates={};
  const allowed=["business","name","type","description","isActive"];
  allowed.forEach(field=>{
   if(req.body[field]!==undefined)updates[field]=typeof req.body[field]==="string"?req.body[field].trim():req.body[field];
  });

  if(updates.name!==undefined&&!updates.name)return res.status(400).json({message:"Category name is required"});

  const category=await HomeCategory.findByIdAndUpdate(req.params.id,updates,{new:true,runValidators:true});
  if(!category)return res.status(404).json({message:"Category not found"});
  return res.json({category});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Category already exists"});
  return next(error);
 }
};

export const deleteHomeCategory=async(req,res,next)=>{
 try{
  const category=await HomeCategory.findByIdAndDelete(req.params.id);
  if(!category)return res.status(404).json({message:"Category not found"});
  return res.json({message:"Category deleted successfully"});
 }catch(error){
  return next(error);
 }
};
