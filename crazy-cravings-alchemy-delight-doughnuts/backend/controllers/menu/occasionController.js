// backend/controllers/menu/occasionController.js
import Occasion from "../../models/menu/OccasionModel.js";

export const createOccasion=async(req,res)=>{
 try{
  const {name,description,months,days,startDate,endDate,isActive}=req.body;

  if(!name||!name.trim()) return res.status(400).json({message:"Name is required"});

  const occasion=await Occasion.create({
   name:name.trim(),
   description:description?.trim()||"",
   months:Array.isArray(months)?months:[],
   days:Array.isArray(days)?days:[],
   startDate:startDate||null,
   endDate:endDate||null,
   isActive:typeof isActive==="boolean"?isActive:true
  });

  return res.status(201).json(occasion);
 }catch(error){
  return res.status(500).json({message:"Failed to create occasion",error:error.message});
 }
};

export const getOccasions=async(req,res)=>{
 try{
  const {search,isActive}=req.query;

  const filter={};

  if(search?.trim()){
   filter.$or=[
    {name:{$regex:search.trim(),$options:"i"}},
    {description:{$regex:search.trim(),$options:"i"}}
   ];
  }

  if(isActive==="true") filter.isActive=true;
  if(isActive==="false") filter.isActive=false;

  const occasions=await Occasion.find(filter).sort({name:1});

  return res.status(200).json(occasions);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch occasions",error:error.message});
 }
};

export const getOccasionById=async(req,res)=>{
 try{
  const occasion=await Occasion.findById(req.params.id);

  if(!occasion) return res.status(404).json({message:"Occasion not found"});

  return res.status(200).json(occasion);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch occasion",error:error.message});
 }
};

export const updateOccasion=async(req,res)=>{
 try{
  const {name,description,months,days,startDate,endDate,isActive}=req.body;

  const updateData={};

  if(name!==undefined){
   if(!name.trim()) return res.status(400).json({message:"Name is required"});
   updateData.name=name.trim();
  }

  if(description!==undefined) updateData.description=description?.trim()||"";
  if(months!==undefined) updateData.months=Array.isArray(months)?months:[];
  if(days!==undefined) updateData.days=Array.isArray(days)?days:[];
  if(startDate!==undefined) updateData.startDate=startDate||null;
  if(endDate!==undefined) updateData.endDate=endDate||null;
  if(isActive!==undefined) updateData.isActive=isActive;

  const occasion=await Occasion.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  );

  if(!occasion) return res.status(404).json({message:"Occasion not found"});

  return res.status(200).json(occasion);
 }catch(error){
  return res.status(500).json({message:"Failed to update occasion",error:error.message});
 }
};

export const deleteOccasion=async(req,res)=>{
 try{
  const occasion=await Occasion.findByIdAndDelete(req.params.id);

  if(!occasion) return res.status(404).json({message:"Occasion not found"});

  return res.status(200).json({message:"Occasion deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete occasion",error:error.message});
 }
};