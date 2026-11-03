// backend/controllers/planner/revisionEditingController.js
import RevisionEditing from "../../models/planner/revisionEditingModel.js";

export const getRevisionEditing=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;
  if(req.query.book_id)filter.book_id=req.query.book_id;

  const revisionEditing=await RevisionEditing.findOne(filter);

  res.status(200).json({
   success:true,
   data:revisionEditing
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get revision editing",
   error:error.message
  });
 }
};

export const getRevisionEditingById=async(req,res)=>{
 try{
  const revisionEditing=await RevisionEditing.findById(req.params.id);

  if(!revisionEditing){
   return res.status(404).json({
    success:false,
    message:"Revision editing not found"
   });
  }

  res.status(200).json({
   success:true,
   data:revisionEditing
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get revision editing",
   error:error.message
  });
 }
};

export const saveRevisionEditing=async(req,res)=>{
 try{
  const {business_id,user_id,book_id}=req.body;

  if(!business_id||!user_id||!book_id){
   return res.status(400).json({
    success:false,
    message:"business_id, user_id, and book_id are required"
   });
  }

  const revisionEditing=await RevisionEditing.findOneAndUpdate(
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
   message:"Revision editing saved",
   data:revisionEditing
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save revision editing",
   error:error.message
  });
 }
};

export const updateRevisionEditing=async(req,res)=>{
 try{
  const revisionEditing=await RevisionEditing.findByIdAndUpdate(
   req.params.id,
   {
    ...req.body,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!revisionEditing){
   return res.status(404).json({
    success:false,
    message:"Revision editing not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Revision editing updated",
   data:revisionEditing
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update revision editing",
   error:error.message
  });
 }
};

export const archiveRevisionEditing=async(req,res)=>{
 try{
  const revisionEditing=await RevisionEditing.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!revisionEditing){
   return res.status(404).json({
    success:false,
    message:"Revision editing not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Revision editing archived",
   data:revisionEditing
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive revision editing",
   error:error.message
  });
 }
};
