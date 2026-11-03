// backend/controllers/planner/writingProgressProductivityController.js
import WritingProgressProductivity from "../../models/planner/writingProgressProductivityModel.js";

export const getWritingProgressProductivity=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;
  if(req.query.book_id)filter.book_id=req.query.book_id;

  const writingProgressProductivity=await WritingProgressProductivity.findOne(filter);

  res.status(200).json({
   success:true,
   data:writingProgressProductivity
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get writing progress productivity",
   error:error.message
  });
 }
};

export const getWritingProgressProductivityById=async(req,res)=>{
 try{
  const writingProgressProductivity=await WritingProgressProductivity.findById(req.params.id);

  if(!writingProgressProductivity){
   return res.status(404).json({
    success:false,
    message:"Writing progress productivity not found"
   });
  }

  res.status(200).json({
   success:true,
   data:writingProgressProductivity
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get writing progress productivity",
   error:error.message
  });
 }
};

export const saveWritingProgressProductivity=async(req,res)=>{
 try{
  const {business_id,user_id,book_id}=req.body;

  if(!business_id||!user_id||!book_id){
   return res.status(400).json({
    success:false,
    message:"business_id, user_id, and book_id are required"
   });
  }

  const writingProgressProductivity=await WritingProgressProductivity.findOneAndUpdate(
   {business_id,user_id,book_id},
   {
    ...req.body,
    updatedBy:req.body.updatedBy||user_id||null
   },
   {
    returnDocument:"after",
    upsert:true,
    runValidators:true,
    setDefaultsOnInsert:true
   }
  );

  res.status(200).json({
   success:true,
   message:"Writing progress productivity saved",
   data:writingProgressProductivity
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save writing progress productivity",
   error:error.message
  });
 }
};

export const updateWritingProgressProductivity=async(req,res)=>{
 try{
  const writingProgressProductivity=await WritingProgressProductivity.findByIdAndUpdate(
   req.params.id,
   {
    ...req.body,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!writingProgressProductivity){
   return res.status(404).json({
    success:false,
    message:"Writing progress productivity not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Writing progress productivity updated",
   data:writingProgressProductivity
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update writing progress productivity",
   error:error.message
  });
 }
};

export const archiveWritingProgressProductivity=async(req,res)=>{
 try{
  const writingProgressProductivity=await WritingProgressProductivity.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!writingProgressProductivity){
   return res.status(404).json({
    success:false,
    message:"Writing progress productivity not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Writing progress productivity archived",
   data:writingProgressProductivity
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive writing progress productivity",
   error:error.message
  });
 }
};
