// backend/controllers/planner/notesBrainstormExtraToolsController.js
import NotesBrainstormExtraTools from "../../models/planner/notesBrainstormExtraToolsModel.js";

export const getNotesBrainstormExtraTools=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;
  if(req.query.book_id)filter.book_id=req.query.book_id;

  const notesBrainstormExtraTools=await NotesBrainstormExtraTools.findOne(filter);

  res.status(200).json({
   success:true,
   data:notesBrainstormExtraTools
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get notes brainstorm extra tools",
   error:error.message
  });
 }
};

export const getNotesBrainstormExtraToolsById=async(req,res)=>{
 try{
  const notesBrainstormExtraTools=await NotesBrainstormExtraTools.findById(req.params.id);

  if(!notesBrainstormExtraTools){
   return res.status(404).json({
    success:false,
    message:"Notes brainstorm extra tools not found"
   });
  }

  res.status(200).json({
   success:true,
   data:notesBrainstormExtraTools
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get notes brainstorm extra tools",
   error:error.message
  });
 }
};

export const saveNotesBrainstormExtraTools=async(req,res)=>{
 try{
  const {business_id,user_id,book_id}=req.body;

  if(!business_id||!user_id||!book_id){
   return res.status(400).json({
    success:false,
    message:"business_id, user_id, and book_id are required"
   });
  }

  const notesBrainstormExtraTools=await NotesBrainstormExtraTools.findOneAndUpdate(
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
   message:"Notes brainstorm extra tools saved",
   data:notesBrainstormExtraTools
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save notes brainstorm extra tools",
   error:error.message
  });
 }
};

export const updateNotesBrainstormExtraTools=async(req,res)=>{
 try{
  const notesBrainstormExtraTools=await NotesBrainstormExtraTools.findByIdAndUpdate(
   req.params.id,
   {
    ...req.body,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!notesBrainstormExtraTools){
   return res.status(404).json({
    success:false,
    message:"Notes brainstorm extra tools not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Notes brainstorm extra tools updated",
   data:notesBrainstormExtraTools
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update notes brainstorm extra tools",
   error:error.message
  });
 }
};

export const archiveNotesBrainstormExtraTools=async(req,res)=>{
 try{
  const notesBrainstormExtraTools=await NotesBrainstormExtraTools.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!notesBrainstormExtraTools){
   return res.status(404).json({
    success:false,
    message:"Notes brainstorm extra tools not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Notes brainstorm extra tools archived",
   data:notesBrainstormExtraTools
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive notes brainstorm extra tools",
   error:error.message
  });
 }
};
