// backend/controllers/foundation/departmentController.js
import Department from "../../models/foundation/departmentModel.js";

export const createDepartment=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   name:req.body.name||"",
   code:req.body.code||"",
   description:req.body.description||"",
   color:req.body.color||"",
   isActive:req.body.isActive!==undefined?req.body.isActive:true
  };

  if(!payload.business||!payload.name){
   return res.status(400).json({message:"business and name are required"});
  }

  const department=await Department.create(payload);

  const populatedDepartment=await Department.findById(department._id)
   .populate("business","name");

  res.status(201).json({
   message:"Department created successfully",
   data:populatedDepartment
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Department code already exists for this business"});
  }
  res.status(500).json({message:"Failed to create department",error:err.message});
 }
};

export const getDepartments=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";
  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {name:{$regex:value,$options:"i"}},
    {code:{$regex:value,$options:"i"}},
    {description:{$regex:value,$options:"i"}}
   ];
  }

  const departments=await Department.find(query)
   .populate("business","name")
   .sort({name:1});

  res.status(200).json({
   message:"Departments fetched successfully",
   data:departments
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch departments",error:err.message});
 }
};

export const getDepartmentById=async(req,res)=>{
 try{
  const department=await Department.findById(req.params.id)
   .populate("business","name");

  if(!department){
   return res.status(404).json({message:"Department not found"});
  }

  res.status(200).json({
   message:"Department fetched successfully",
   data:department
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch department",error:err.message});
 }
};

export const updateDepartment=async(req,res)=>{
 try{
  const existing=await Department.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Department not found"});
  }

  const department=await Department.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     name:req.body.name!==undefined?req.body.name:existing.name,
     code:req.body.code!==undefined?req.body.code:existing.code,
     description:req.body.description!==undefined?req.body.description:existing.description,
     color:req.body.color!==undefined?req.body.color:existing.color,
     isActive:req.body.isActive!==undefined?req.body.isActive:existing.isActive
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name");

  res.status(200).json({
   message:"Department updated successfully",
   data:department
  });
 }catch(err){
  if(err?.code===11000){
   return res.status(409).json({message:"Department code already exists for this business"});
  }
  res.status(500).json({message:"Failed to update department",error:err.message});
 }
};

export const deleteDepartment=async(req,res)=>{
 try{
  const department=await Department.findByIdAndDelete(req.params.id);

  if(!department){
   return res.status(404).json({message:"Department not found"});
  }

  res.status(200).json({
   message:"Department deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete department",error:err.message});
 }
};