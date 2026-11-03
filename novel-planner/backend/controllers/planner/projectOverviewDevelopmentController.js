// backend/controllers/planner/projectOverviewDevelopmentController.js
import ProjectOverviewDevelopment from "../../models/planner/projectOverviewDevelopmentModel.js";

export const getProjectOverviewDevelopment=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;
  if(req.query.book_id)filter.book_id=req.query.book_id;

  const projectOverviewDevelopment=await ProjectOverviewDevelopment.findOne(filter);

  res.status(200).json({
   success:true,
   data:projectOverviewDevelopment
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get project overview development",
   error:error.message
  });
 }
};

export const getProjectOverviewDevelopmentById=async(req,res)=>{
 try{
  const projectOverviewDevelopment=await ProjectOverviewDevelopment.findById(req.params.id);

  if(!projectOverviewDevelopment){
   return res.status(404).json({
    success:false,
    message:"Project overview development not found"
   });
  }

  res.status(200).json({
   success:true,
   data:projectOverviewDevelopment
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get project overview development",
   error:error.message
  });
 }
};

export const saveProjectOverviewDevelopment=async(req,res)=>{
 try{
  const {business_id,user_id,book_id}=req.body;

  if(!business_id||!user_id||!book_id){
   return res.status(400).json({
    success:false,
    message:"business_id, user_id, and book_id are required"
   });
  }

  const projectOverviewDevelopment=await ProjectOverviewDevelopment.findOneAndUpdate(
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
   message:"Project overview development saved",
   data:projectOverviewDevelopment
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save project overview development",
   error:error.message
  });
 }
};

export const updateProjectOverviewDevelopment=async(req,res)=>{
 try{
  const projectOverviewDevelopment=await ProjectOverviewDevelopment.findByIdAndUpdate(
   req.params.id,
   {
    ...req.body,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!projectOverviewDevelopment){
   return res.status(404).json({
    success:false,
    message:"Project overview development not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Project overview development updated",
   data:projectOverviewDevelopment
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update project overview development",
   error:error.message
  });
 }
};

export const archiveProjectOverviewDevelopment=async(req,res)=>{
 try{
  const projectOverviewDevelopment=await ProjectOverviewDevelopment.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!projectOverviewDevelopment){
   return res.status(404).json({
    success:false,
    message:"Project overview development not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Project overview development archived",
   data:projectOverviewDevelopment
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive project overview development",
   error:error.message
  });
 }
};
