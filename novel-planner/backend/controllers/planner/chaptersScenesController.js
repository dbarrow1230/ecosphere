// backend/controllers/planner/chaptersScenesController.js
import ChaptersScenes from "../../models/planner/chaptersScenesModel.js";

export const getChaptersScenes=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;
  if(req.query.book_id)filter.book_id=req.query.book_id;

  const chaptersScenes=await ChaptersScenes.findOne(filter);

  res.status(200).json({
   success:true,
   data:chaptersScenes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get chapters scenes",
   error:error.message
  });
 }
};

export const getChaptersScenesById=async(req,res)=>{
 try{
  const chaptersScenes=await ChaptersScenes.findById(req.params.id);

  if(!chaptersScenes){
   return res.status(404).json({
    success:false,
    message:"Chapters scenes not found"
   });
  }

  res.status(200).json({
   success:true,
   data:chaptersScenes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get chapters scenes",
   error:error.message
  });
 }
};

export const saveChaptersScenes=async(req,res)=>{
 try{
  const {business_id,user_id,book_id}=req.body;

  if(!business_id||!user_id||!book_id){
   return res.status(400).json({
    success:false,
    message:"business_id, user_id, and book_id are required"
   });
  }

  const chaptersScenes=await ChaptersScenes.findOneAndUpdate(
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
   message:"Chapters scenes saved",
   data:chaptersScenes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save chapters scenes",
   error:error.message
  });
 }
};

export const updateChaptersScenes=async(req,res)=>{
 try{
  const chaptersScenes=await ChaptersScenes.findByIdAndUpdate(
   req.params.id,
   {
    ...req.body,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!chaptersScenes){
   return res.status(404).json({
    success:false,
    message:"Chapters scenes not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Chapters scenes updated",
   data:chaptersScenes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update chapters scenes",
   error:error.message
  });
 }
};

export const archiveChaptersScenes=async(req,res)=>{
 try{
  const chaptersScenes=await ChaptersScenes.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!chaptersScenes){
   return res.status(404).json({
    success:false,
    message:"Chapters scenes not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Chapters scenes archived",
   data:chaptersScenes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive chapters scenes",
   error:error.message
  });
 }
};
