import mongoose from "mongoose";
import Business from "../../models/reference/businessModel.js";
import BusinessDepartment from "../../models/users/businessDepartmentModel.js";
import DepartmentPermission from "../../models/users/departmentPermissionModel.js";
import PermissionModule from "../../models/users/permissionModuleModel.js";

const fields=["create","read","update","delete","admin"];
const normalizeId=value=>String(value?._id?.$oid||value?._id||value?.$oid||value||"").trim();
const normalizeModule=value=>String(value||"").trim().toLowerCase();

const permissionValues=body=>{
 const values={};
 for(const field of fields){
  if(body[field]!==undefined)values[field]=!!body[field];
 }
 if(values.admin)Object.assign(values,{create:true,read:true,update:true,delete:true});
 return values;
};

const populate=query=>query
 .populate({path:"business",model:Business})
 .populate({path:"department",model:BusinessDepartment});

const validateScope=async({businessId,departmentId,module})=>{
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
 if(String(department.business)!==String(businessId))return {status:400,message:"Department does not belong to the selected business"};
 if(!permissionModule)return {status:404,message:"Permission module not found or inactive"};
 return {};
};

export const createDepartmentPermission=async(req,res)=>{
 try{
  const businessId=normalizeId(req.body.business);
  const departmentId=normalizeId(req.body.department);
  const module=normalizeModule(req.body.module);
  const validation=await validateScope({businessId,departmentId,module});
  if(validation.status)return res.status(validation.status).json({success:false,message:validation.message});

  const doc=await DepartmentPermission.create({business:businessId,department:departmentId,module,...permissionValues(req.body)});
  const data=await populate(DepartmentPermission.findById(doc._id));
  return res.status(201).json({success:true,message:"Department permission created successfully",data});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Permission already exists for this business, department, and module"});
  return res.status(500).json({success:false,message:error.message||"Failed to create department permission"});
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
  const data=await populate(DepartmentPermission.find(query).sort({business:1,department:1,module:1}));
  return res.json({success:true,count:data.length,data});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch department permissions"});
 }
};

export const getDepartmentPermissionById=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid department permission id"});
  const data=await populate(DepartmentPermission.findById(req.params.id));
  if(!data)return res.status(404).json({success:false,message:"Department permission not found"});
  return res.json({success:true,data});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch department permission"});
 }
};

export const updateDepartmentPermission=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid department permission id"});
  const doc=await DepartmentPermission.findById(req.params.id);
  if(!doc)return res.status(404).json({success:false,message:"Department permission not found"});

  const businessId=req.body.business!==undefined?normalizeId(req.body.business):normalizeId(doc.business);
  const departmentId=req.body.department!==undefined?normalizeId(req.body.department):normalizeId(doc.department);
  const module=req.body.module!==undefined?normalizeModule(req.body.module):normalizeModule(doc.module);
  const validation=await validateScope({businessId,departmentId,module});
  if(validation.status)return res.status(validation.status).json({success:false,message:validation.message});

  doc.business=businessId;
  doc.department=departmentId;
  doc.module=module;
  Object.assign(doc,permissionValues(req.body));
  await doc.save();
  const data=await populate(DepartmentPermission.findById(doc._id));
  return res.json({success:true,message:"Department permission updated successfully",data});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Permission already exists for this business, department, and module"});
  return res.status(500).json({success:false,message:error.message||"Failed to update department permission"});
 }
};

export const deleteDepartmentPermission=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid department permission id"});
  const doc=await DepartmentPermission.findByIdAndDelete(req.params.id);
  if(!doc)return res.status(404).json({success:false,message:"Department permission not found"});
  return res.json({success:true,message:"Department permission deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to delete department permission"});
 }
};
