// backend/controllers/planner/characterDevelopmentController.js
import CharacterDevelopment from "../../models/planner/characterDevelopmentModel.js";

export const getCharacterDevelopment=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;
  if(req.query.book_id)filter.book_id=req.query.book_id;

  const characterDevelopment=await CharacterDevelopment.findOne(filter);

  res.status(200).json({
   success:true,
   data:characterDevelopment
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get character development",
   error:error.message
  });
 }
};

export const getCharacterDevelopmentById=async(req,res)=>{
 try{
  const characterDevelopment=await CharacterDevelopment.findById(req.params.id);

  if(!characterDevelopment){
   return res.status(404).json({
    success:false,
    message:"Character development not found"
   });
  }

  res.status(200).json({
   success:true,
   data:characterDevelopment
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get character development",
   error:error.message
  });
 }
};

export const saveCharacterDevelopment=async(req,res)=>{
 try{
  const {business_id,user_id,book_id}=req.body;

  if(!business_id||!user_id||!book_id){
   return res.status(400).json({
    success:false,
    message:"business_id, user_id, and book_id are required"
   });
  }

  const characterDevelopment=await CharacterDevelopment.findOneAndUpdate(
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
   message:"Character development saved",
   data:characterDevelopment
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save character development",
   error:error.message
  });
 }
};

export const updateCharacterDevelopment=async(req,res)=>{
 try{
  const characterDevelopment=await CharacterDevelopment.findByIdAndUpdate(
   req.params.id,
   {
    ...req.body,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!characterDevelopment){
   return res.status(404).json({
    success:false,
    message:"Character development not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Character development updated",
   data:characterDevelopment
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update character development",
   error:error.message
  });
 }
};

export const archiveCharacterDevelopment=async(req,res)=>{
 try{
  const characterDevelopment=await CharacterDevelopment.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!characterDevelopment){
   return res.status(404).json({
    success:false,
    message:"Character development not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Character development archived",
   data:characterDevelopment
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive character development",
   error:error.message
  });
 }
};
