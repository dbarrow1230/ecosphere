// backend/controllers/employee/emergencyContactController.js
import EmergencyContact from "../../models/employee/emergencyContactModel.js";

export const createEmergencyContact=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee,
   name:req.body.name||"",
   relationship:req.body.relationship||"",
   phone:req.body.phone||"",
   email:req.body.email||"",
   address:req.body.address||"",
   notes:req.body.notes||"",
   isPrimary:req.body.isPrimary!==undefined?req.body.isPrimary:true,
   isActive:req.body.isActive!==undefined?req.body.isActive:true
  };

  if(!payload.business||!payload.employee){
   return res.status(400).json({message:"business and employee are required"});
  }

  if(payload.isPrimary){
   await EmergencyContact.updateMany(
    {business:payload.business,employee:payload.employee,isPrimary:true},
    {$set:{isPrimary:false}}
   );
  }

  const emergencyContact=await EmergencyContact.create(payload);

  res.status(201).json({
   message:"Emergency contact created successfully",
   data:emergencyContact
  });
 }catch(err){
  res.status(500).json({message:"Failed to create emergency contact",error:err.message});
 }
};

export const getEmergencyContacts=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

  const emergencyContacts=await EmergencyContact.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .sort({isPrimary:-1,name:1});

  res.status(200).json({
   message:"Emergency contacts fetched successfully",
   data:emergencyContacts
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch emergency contacts",error:err.message});
 }
};

export const getEmergencyContactById=async(req,res)=>{
 try{
  const emergencyContact=await EmergencyContact.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId");

  if(!emergencyContact){
   return res.status(404).json({message:"Emergency contact not found"});
  }

  res.status(200).json({
   message:"Emergency contact fetched successfully",
   data:emergencyContact
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch emergency contact",error:err.message});
 }
};

export const updateEmergencyContact=async(req,res)=>{
 try{
  const existing=await EmergencyContact.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Emergency contact not found"});
  }

  const nextIsPrimary=req.body.isPrimary!==undefined?req.body.isPrimary:existing.isPrimary;
  const nextBusiness=req.body.business||existing.business;
  const nextEmployee=req.body.employee||existing.employee;

  if(nextIsPrimary){
   await EmergencyContact.updateMany(
    {_id:{$ne:existing._id},business:nextBusiness,employee:nextEmployee,isPrimary:true},
    {$set:{isPrimary:false}}
   );
  }

  const emergencyContact=await EmergencyContact.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     name:req.body.name!==undefined?req.body.name:existing.name,
     relationship:req.body.relationship!==undefined?req.body.relationship:existing.relationship,
     phone:req.body.phone!==undefined?req.body.phone:existing.phone,
     email:req.body.email!==undefined?req.body.email:existing.email,
     address:req.body.address!==undefined?req.body.address:existing.address,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes,
     isPrimary:req.body.isPrimary!==undefined?req.body.isPrimary:existing.isPrimary,
     isActive:req.body.isActive!==undefined?req.body.isActive:existing.isActive
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId");

  res.status(200).json({
   message:"Emergency contact updated successfully",
   data:emergencyContact
  });
 }catch(err){
  res.status(500).json({message:"Failed to update emergency contact",error:err.message});
 }
};

export const deleteEmergencyContact=async(req,res)=>{
 try{
  const emergencyContact=await EmergencyContact.findByIdAndDelete(req.params.id);

  if(!emergencyContact){
   return res.status(404).json({message:"Emergency contact not found"});
  }

  res.status(200).json({
   message:"Emergency contact deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete emergency contact",error:err.message});
 }
};