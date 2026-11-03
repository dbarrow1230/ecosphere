// backend/controllers/users/departmentPermissionController.js
import mongoose from "mongoose";
import Business from "../../models/reference/businessModel.js";
import BusinessDepartment from "../../models/users/businessDepartmentModel.js";
import DepartmentPermission from "../../models/users/departmentPermissionModel.js";
import PermissionModule from "../../models/users/permissionModuleModel.js";

const normalizeId=value=>{
 if(!value)return "";

 if(typeof value==="string")return value.trim();

 if(typeof value==="object"){
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.$oid==="string")return value.$oid;
 }

 return String(value).trim();
};

const normalizeModule=value=>{
 return String(value||"").trim().toLowerCase();
};

const normalizePermissionBooleans=body=>{
 const payload={};

 ["create","read","update","delete","admin"].forEach(field=>{
  if(body[field]!==undefined)payload[field]=!!body[field];
 });

 if(payload.admin){
  payload.create=true;
  payload.read=true;
  payload.update=true;
  payload.delete=true;
 }

 return payload;
};

const populateDepartmentPermission=query=>{
 return query
  .populate({path:"business",model:Business})
  .populate({path:"department",model:BusinessDepartment});
};

const validateBusinessDepartmentAndModule=async({businessId,departmentId,module})=>{
 if(!businessId)return {status:400,message:"Business is required"};
 if(!departmentId)return {status:400,message:"Department is required"};
 if(!module)return {status:400,message:"Module is required"};

 if(!mongoose.Types.ObjectId.isValid(businessId))return {status:400,message:"Invalid business id"};
 if(!mongoose.Types.ObjectId.isValid(departmentId))return {status:400,message:"Invalid department id"};

 const [business,department,permissionModule]=await Promise.all([
  Business.findById(businessId).select("_id"),
  BusinessDepartment.findById(departmentId).select("_id business"),
  PermissionModule.findOne({business:businessId,key:module,isActive:true}).select("_id")
 ]);

 if(!business)return {status:404,message:"Business not found"};
 if(!department)return {status:404,message:"Department not found"};

 if(String(department.business)!==String(businessId)){
  return {status:400,message:"Department does not belong to the selected business"};
 }

 if(!permissionModule)return {status:404,message:"Permission module not found or inactive"};

 return {business,department,permissionModule};
};

export const createDepartmentPermission=async(req,res)=>{
 try{
  const businessId=normalizeId(req.body.business);
  const departmentId=normalizeId(req.body.department);
  const module=normalizeModule(req.body.module);
  const validation=await validateBusinessDepartmentAndModule({businessId,departmentId,module});

  if(validation.status){
   return res.status(validation.status).json({success:false,message:validation.message});
  }

  const permissionPayload=normalizePermissionBooleans(req.body);
  const doc=await DepartmentPermission.create({
   business:businessId,
   department:departmentId,
   module,
   create:permissionPayload.create||false,
   read:permissionPayload.read||false,
   update:permissionPayload.update||false,
   delete:permissionPayload.delete||false,
   admin:permissionPayload.admin||false
  });

  const populated=await populateDepartmentPermission(DepartmentPermission.findById(doc._id));

  return res.status(201).json({
   success:true,
   message:"Department permission created successfully",
   data:populated
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Permission already exists for this business, department, and module"});
  }

  return res.status(500).json({
   success:false,
   message:error.message||"Failed to create department permission"
  });
 }
};

export const getDepartmentPermissions=async(req,res)=>{
 try{
  const businessId=normalizeId(req.query.business);
  const departmentId=normalizeId(req.query.department);
  const module=normalizeModule(req.query.module);
  const query={};

  if(businessId){
   if(!mongoose.Types.ObjectId.isValid(businessId))return res.status(400).json({success:false,message:"Invalid business id"});
   query.business=businessId;
  }

  if(departmentId){
   if(!mongoose.Types.ObjectId.isValid(departmentId))return res.status(400).json({success:false,message:"Invalid department id"});
   query.department=departmentId;
  }

  if(module)query.module=module;

  const data=await populateDepartmentPermission(
   DepartmentPermission.find(query).sort({business:1,department:1,module:1})
  );

  return res.status(200).json({success:true,count:data.length,data});
 }catch(error){
  return res.status(500).json({
   success:false,
   message:error.message||"Failed to fetch department permissions"
  });
 }
};

export const getDepartmentPermissionById=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid department permission id"});
  }

  const doc=await populateDepartmentPermission(DepartmentPermission.findById(id));

  if(!doc)return res.status(404).json({success:false,message:"Department permission not found"});

  return res.status(200).json({success:true,data:doc});
 }catch(error){
  return res.status(500).json({
   success:false,
   message:error.message||"Failed to fetch department permission"
  });
 }
};

export const updateDepartmentPermission=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid department permission id"});
  }

  const doc=await DepartmentPermission.findById(id);
  if(!doc)return res.status(404).json({success:false,message:"Department permission not found"});

  const nextBusinessId=req.body.business!==undefined?normalizeId(req.body.business):normalizeId(doc.business);
  const nextDepartmentId=req.body.department!==undefined?normalizeId(req.body.department):normalizeId(doc.department);
  const nextModule=req.body.module!==undefined?normalizeModule(req.body.module):normalizeModule(doc.module);
  const validation=await validateBusinessDepartmentAndModule({
   businessId:nextBusinessId,
   departmentId:nextDepartmentId,
   module:nextModule
  });

  if(validation.status){
   return res.status(validation.status).json({success:false,message:validation.message});
  }

  if(req.body.business!==undefined)doc.business=nextBusinessId;
  if(req.body.department!==undefined)doc.department=nextDepartmentId;
  if(req.body.module!==undefined)doc.module=nextModule;

  Object.entries(normalizePermissionBooleans(req.body)).forEach(([field,value])=>{
   doc[field]=value;
  });

  await doc.save();

  const updated=await populateDepartmentPermission(DepartmentPermission.findById(id));

  return res.status(200).json({
   success:true,
   message:"Department permission updated successfully",
   data:updated
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({success:false,message:"Permission already exists for this business, department, and module"});
  }

  return res.status(500).json({
   success:false,
   message:error.message||"Failed to update department permission"
  });
 }
};

export const deleteDepartmentPermission=async(req,res)=>{
 try{
  const {id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({success:false,message:"Invalid department permission id"});
  }

  const doc=await DepartmentPermission.findByIdAndDelete(id);
  if(!doc)return res.status(404).json({success:false,message:"Department permission not found"});

  return res.status(200).json({
   success:true,
   message:"Department permission deleted successfully"
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:error.message||"Failed to delete department permission"
  });
 }
};
