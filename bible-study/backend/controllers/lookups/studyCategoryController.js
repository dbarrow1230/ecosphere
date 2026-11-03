// backend/controllers/lookups/studyCategoryController.js
import StudyCategory from "../../models/lookups/studyCategoryModel.js";

export const getStudyCategories=async(req,res)=>{
 try{
  const {active}=req.query;
  const filter={};

  if(active==="true")filter.active=true;
  if(active==="false")filter.active=false;

  const categories=await StudyCategory.find(filter).sort({sortOrder:1,title:1});

  return res.status(200).json({
   success:true,
   count:categories.length,
   data:categories
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study categories",
   error:err.message
  });
 }
};

export const getStudyCategoryById=async(req,res)=>{
 try{
  const category=await StudyCategory.findById(req.params.id);

  if(!category){
   return res.status(404).json({
    success:false,
    message:"Study category not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:category
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study category",
   error:err.message
  });
 }
};

export const createStudyCategory=async(req,res)=>{
 try{
  const category=await StudyCategory.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Study category created successfully",
   data:category
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create study category",
   error:err.message
  });
 }
};

export const updateStudyCategory=async(req,res)=>{
 try{
  const category=await StudyCategory.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!category){
   return res.status(404).json({
    success:false,
    message:"Study category not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study category updated successfully",
   data:category
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update study category",
   error:err.message
  });
 }
};

export const deleteStudyCategory=async(req,res)=>{
 try{
  const category=await StudyCategory.findByIdAndDelete(req.params.id);

  if(!category){
   return res.status(404).json({
    success:false,
    message:"Study category not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study category deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete study category",
   error:err.message
  });
 }
};