// backend/controllers/users/businessDepartmentController.js
import mongoose from "mongoose";
import Business from "../../models/reference/businessModel.js";
import Role from "../../models/users/roleModel.js";
import BusinessDepartment from "../../models/users/businessDepartmentModel.js";

const normalizeId=value=>{
 if(!value)return "";

 if(typeof value==="string")return value.trim();

 if(typeof value==="object")
 {
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.$oid==="string")return value.$oid;
 }

 return String(value).trim();
};

const normalizeString=value=>{
 return String(value||"").trim();
};

const normalizeCode=value=>{
 return String(value||"").trim().toUpperCase();
};

const normalizeAccountingCode=value=>{
 return String(value||"").trim().toUpperCase();
};

const populateDepartment=query=>{
 return query
  .populate({
   path:"business",
   model:Business
  })
  .populate({
   path:"defaultRole",
   model:Role
  });
};

const validateBusiness=async businessId=>{
 if(!businessId)
 {
  return {status:400,message:"Business is required"};
 }

 if(!mongoose.Types.ObjectId.isValid(businessId))
 {
  return {status:400,message:"Invalid business id"};
 }

 const business=await Business.findById(businessId).select("_id");

 if(!business)
 {
  return {status:404,message:"Business not found"};
 }

 return {business};
};

const validateDefaultRole=async({businessId,roleId})=>{
 if(!roleId)
 {
  return {};
 }

 if(!mongoose.Types.ObjectId.isValid(roleId))
 {
  return {status:400,message:"Invalid default role id"};
 }

 const role=await Role.findById(roleId).select("_id business");

 if(!role)
 {
  return {status:404,message:"Default role not found"};
 }

 if(String(role.business)!==String(businessId))
 {
  return {status:400,message:"Default role does not belong to the selected business"};
 }

 return {role};
};

export const createBusinessDepartment=async(req,res)=>{
 try
 {
  const businessId=normalizeId(req.body.business);
  const name=normalizeString(req.body.name);
  const code=normalizeCode(req.body.code);
  const accountingCode=normalizeAccountingCode(req.body.accountingCode);
  const description=normalizeString(req.body.description);
  const defaultRoleId=normalizeId(req.body.defaultRole);
  const isDefault=req.body.isDefault===undefined?false:!!req.body.isDefault;
  const isActive=req.body.isActive===undefined?true:!!req.body.isActive;

  if(!businessId||!name||!code)
  {
   return res.status(400).json({success:false,message:"Business, name, and department code are required"});
  }

  const businessValidation=await validateBusiness(businessId);

  if(businessValidation.status)
  {
   return res.status(businessValidation.status).json({success:false,message:businessValidation.message});
  }

  const roleValidation=await validateDefaultRole({businessId,roleId:defaultRoleId});

  if(roleValidation.status)
  {
   return res.status(roleValidation.status).json({success:false,message:roleValidation.message});
  }

  const doc=await BusinessDepartment.create({
   business:businessId,
   name,
   code,
   accountingCode,
   description,
   defaultRole:defaultRoleId||null,
   isDefault,
   isActive
  });

  const populated=await populateDepartment(BusinessDepartment.findById(doc._id));

  return res.status(201).json({
   success:true,
   message:"Business department created successfully",
   data:populated
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({success:false,message:"Department code already exists for this business"});
  }

  console.error("createBusinessDepartment error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to create business department",
   error:error.message
  });
 }
};

export const getBusinessDepartments=async(req,res)=>{
 try
 {
  const businessId=normalizeId(req.query.business);
  const isActive=req.query.isActive;
  const query={};

  if(!businessId)
  {
   return res.status(400).json({success:false,message:"Business is required"});
  }

  if(businessId)
  {
   if(!mongoose.Types.ObjectId.isValid(businessId))
   {
    return res.status(400).json({success:false,message:"Invalid business id"});
   }

   query.business=businessId;
  }

  if(isActive!==undefined)
  {
   query.isActive=isActive==="true";
  }

  const data=await populateDepartment(
   BusinessDepartment.find(query).sort({business:1,isDefault:-1,name:1,code:1})
  );

  return res.status(200).json({
   success:true,
   count:data.length,
   data
  });
 }
 catch(error)
 {
  console.error("getBusinessDepartments error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch business departments",
   error:error.message
  });
 }
};

export const getBusinessDepartmentById=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid department id"});
  }

  const doc=await populateDepartment(BusinessDepartment.findById(id));

  if(!doc)
  {
   return res.status(404).json({success:false,message:"Business department not found"});
  }

  return res.status(200).json({
   success:true,
   data:doc
  });
 }
 catch(error)
 {
  console.error("getBusinessDepartmentById error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to fetch business department",
   error:error.message
  });
 }
};

export const updateBusinessDepartment=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid department id"});
  }

  const doc=await BusinessDepartment.findById(id);

  if(!doc)
  {
   return res.status(404).json({success:false,message:"Business department not found"});
  }

  const nextBusinessId=req.body.business!==undefined?normalizeId(req.body.business):String(doc.business);
  const nextDefaultRoleId=req.body.defaultRole!==undefined?normalizeId(req.body.defaultRole):normalizeId(doc.defaultRole);

  const businessValidation=await validateBusiness(nextBusinessId);

  if(businessValidation.status)
  {
   return res.status(businessValidation.status).json({success:false,message:businessValidation.message});
  }

  const roleValidation=await validateDefaultRole({
   businessId:nextBusinessId,
   roleId:nextDefaultRoleId
  });

  if(roleValidation.status)
  {
   return res.status(roleValidation.status).json({success:false,message:roleValidation.message});
  }

  if(req.body.business!==undefined)
  {
   doc.business=nextBusinessId;
  }

  if(req.body.name!==undefined)
  {
   const name=normalizeString(req.body.name);

   if(!name)
   {
    return res.status(400).json({success:false,message:"Name is required"});
   }

   doc.name=name;
  }

  if(req.body.code!==undefined)
  {
   const code=normalizeCode(req.body.code);

   if(!code)
   {
    return res.status(400).json({success:false,message:"Department code is required"});
   }

   doc.code=code;
  }

  if(req.body.accountingCode!==undefined)
  {
   doc.accountingCode=normalizeAccountingCode(req.body.accountingCode);
  }

  if(req.body.description!==undefined)
  {
   doc.description=normalizeString(req.body.description);
  }

  if(req.body.defaultRole!==undefined)
  {
   doc.defaultRole=nextDefaultRoleId||null;
  }

  if(req.body.isDefault!==undefined)
  {
   doc.isDefault=!!req.body.isDefault;
  }

  if(req.body.isActive!==undefined)
  {
   doc.isActive=!!req.body.isActive;
  }

  await doc.save();

  const updated=await populateDepartment(BusinessDepartment.findById(id));

  return res.status(200).json({
   success:true,
   message:"Business department updated successfully",
   data:updated
  });
 }
 catch(error)
 {
  if(error.code===11000)
  {
   return res.status(409).json({success:false,message:"Department code already exists for this business"});
  }

  console.error("updateBusinessDepartment error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to update business department",
   error:error.message
  });
 }
};

export const deleteBusinessDepartment=async(req,res)=>{
 try
 {
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id))
  {
   return res.status(400).json({success:false,message:"Invalid department id"});
  }

  const doc=await BusinessDepartment.findByIdAndDelete(id);

  if(!doc)
  {
   return res.status(404).json({success:false,message:"Business department not found"});
  }

  return res.status(200).json({
   success:true,
   message:"Business department deleted successfully"
  });
 }
 catch(error)
 {
  console.error("deleteBusinessDepartment error",error);

  return res.status(500).json({
   success:false,
   message:"Failed to delete business department",
   error:error.message
  });
 }
};
