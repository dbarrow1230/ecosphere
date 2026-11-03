// backend/controllers/planner/worldBuildingSettingController.js
import WorldBuildingSetting from "../../models/planner/worldBuildingSettingModel.js";

export const getWorldBuildingSetting=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;
  if(req.query.book_id)filter.book_id=req.query.book_id;

  const worldBuildingSetting=await WorldBuildingSetting.findOne(filter);

  res.status(200).json({
   success:true,
   data:worldBuildingSetting
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get world building setting",
   error:error.message
  });
 }
};

export const getWorldBuildingSettingById=async(req,res)=>{
 try{
  const worldBuildingSetting=await WorldBuildingSetting.findById(req.params.id);

  if(!worldBuildingSetting){
   return res.status(404).json({
    success:false,
    message:"World building setting not found"
   });
  }

  res.status(200).json({
   success:true,
   data:worldBuildingSetting
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get world building setting",
   error:error.message
  });
 }
};

export const saveWorldBuildingSetting=async(req,res)=>{
 try{
  const {business_id,user_id,book_id}=req.body;

  if(!business_id||!user_id||!book_id){
   return res.status(400).json({
    success:false,
    message:"business_id, user_id, and book_id are required"
   });
  }

  const worldBuildingSetting=await WorldBuildingSetting.findOneAndUpdate(
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
   message:"World building setting saved",
   data:worldBuildingSetting
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to save world building setting",
   error:error.message
  });
 }
};

export const updateWorldBuildingSetting=async(req,res)=>{
 try{
  const worldBuildingSetting=await WorldBuildingSetting.findByIdAndUpdate(
   req.params.id,
   {
    ...req.body,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!worldBuildingSetting){
   return res.status(404).json({
    success:false,
    message:"World building setting not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"World building setting updated",
   data:worldBuildingSetting
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update world building setting",
   error:error.message
  });
 }
};

export const archiveWorldBuildingSetting=async(req,res)=>{
 try{
  const worldBuildingSetting=await WorldBuildingSetting.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!worldBuildingSetting){
   return res.status(404).json({
    success:false,
    message:"World building setting not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"World building setting archived",
   data:worldBuildingSetting
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive world building setting",
   error:error.message
  });
 }
};
