// backend/controllers/planner/characterRoleController.js
import CharacterRole from "../../models/planner/characterRoleModel.js";

export const getCharacterRoles=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;

  const characterRoles=await CharacterRole.find(filter).sort({isDefault:-1,name:1});

  res.status(200).json({
   success:true,
   count:characterRoles.length,
   data:characterRoles
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get character roles",
   error:error.message
  });
 }
};

export const getCharacterRoleById=async(req,res)=>{
 try{
  const characterRole=await CharacterRole.findById(req.params.id);

  if(!characterRole){
   return res.status(404).json({
    success:false,
    message:"Character role not found"
   });
  }

  res.status(200).json({
   success:true,
   data:characterRole
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get character role",
   error:error.message
  });
 }
};

export const createCharacterRole=async(req,res)=>{
 try{
  const characterRole=await CharacterRole.create(req.body);

  res.status(201).json({
   success:true,
   message:"Character role created",
   data:characterRole
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({
    success:false,
    message:"Character role already exists for this business and user"
   });
  }

  res.status(500).json({
   success:false,
   message:"Failed to create character role",
   error:error.message
  });
 }
};

export const updateCharacterRole=async(req,res)=>{
 try{
  const characterRole=await CharacterRole.findByIdAndUpdate(
   req.params.id,
   {
    ...req.body,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!characterRole){
   return res.status(404).json({
    success:false,
    message:"Character role not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Character role updated",
   data:characterRole
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({
    success:false,
    message:"Character role already exists for this business and user"
   });
  }

  res.status(500).json({
   success:false,
   message:"Failed to update character role",
   error:error.message
  });
 }
};

export const archiveCharacterRole=async(req,res)=>{
 try{
  const characterRole=await CharacterRole.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!characterRole){
   return res.status(404).json({
    success:false,
    message:"Character role not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Character role archived",
   data:characterRole
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive character role",
   error:error.message
  });
 }
};

export const deleteCharacterRole=async(req,res)=>{
 try{
  const characterRole=await CharacterRole.findByIdAndDelete(req.params.id);

  if(!characterRole){
   return res.status(404).json({
    success:false,
    message:"Character role not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Character role deleted",
   data:characterRole
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to delete character role",
   error:error.message
  });
 }
};
