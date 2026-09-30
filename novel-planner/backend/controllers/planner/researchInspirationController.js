// backend/controllers/planner/researchInspirationController.js
import ResearchInspiration from "../../models/planner/researchInspirationModel.js";

export const getResearchInspiration=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;
  if(req.query.book_id)filter.book_id=req.query.book_id;

  const researchInspiration=await ResearchInspiration.findOne(filter);

  res.status(200).json({
   success:true,
   data:researchInspiration
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get research inspiration",
   error:error.message
  });
 }
};

export const getResearchInspirationById=async(req,res)=>{
 try{
  const researchInspiration=await ResearchInspiration.findById(req.params.id);

  if(!researchInspiration){
   return res.status(404).json({
    success:false,
    message:"Research inspiration not found"
   });
  }

  res.status(200).json({
   success:true,
   data:researchInspiration
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get research inspiration",
   error:error.message
  });
 }
};

export const saveResearchInspiration=async(req,res)=>{
 try{
  const {business_id,user_id,book_id}=req.body;

  if(!business_id||!user_id||!book_id){
   return res.status(400).json({
    success:false,
    message:"business_id, user_id, and book_id are required"
   });
  }

  const researchInspiration=await ResearchInspiration.findOneAndUpdate(
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
   message:"Research inspiration saved",
   data:researchInspiration
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save research inspiration",
   error:error.message
  });
 }
};

export const updateResearchInspiration=async(req,res)=>{
 try{
  const researchInspiration=await ResearchInspiration.findByIdAndUpdate(
   req.params.id,
   {
    ...req.body,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!researchInspiration){
   return res.status(404).json({
    success:false,
    message:"Research inspiration not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Research inspiration updated",
   data:researchInspiration
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update research inspiration",
   error:error.message
  });
 }
};

export const archiveResearchInspiration=async(req,res)=>{
 try{
  const researchInspiration=await ResearchInspiration.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!researchInspiration){
   return res.status(404).json({
    success:false,
    message:"Research inspiration not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Research inspiration archived",
   data:researchInspiration
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive research inspiration",
   error:error.message
  });
 }
};
