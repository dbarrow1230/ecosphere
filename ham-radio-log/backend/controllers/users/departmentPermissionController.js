import mongoose from "mongoose";
import Business from "../../models/reference/businessModel.js";
import BusinessDepartment from "../../models/users/businessDepartmentModel.js";
import DepartmentPermission from "../../models/users/departmentPermissionModel.js";
import PermissionModule from "../../models/users/permissionModuleModel.js";

const normalizeId=value=>String(value?._id?.$oid||value?._id||value?.$oid||value||"").trim();
const normalizeModule=value=>String(value||"").trim().toLowerCase();

const normalizePermissions=body=>{
 const payload={};
 for(const field of ["create","read","update","delete","admin"]){
  if(body[field]!==undefined)payload[field]=!!body[field];
 }
 if(payload.admin)Object.assign(payload,{create:true,read:true,update:true,delete:true});
 return payload;
};

const validateScope=async({businessId,departmentId,module})=>{
 if(!mongoose.Types.ObjectId.isValid(businessId))return {status:400,message:"Invalid business id"};
 if(!mongoose.Types.ObjectId.isValid(departmentId))return {status:400,message:"Invalid department id"};
 if(!module)return {status:400,message:"Module is required"};

 const [business,department,permissionModule]=await Promise.all([
  Business.findById(businessId).select("_id"),
  BusinessDepartment.findById(departmentId).select("_id business"),
  PermissionModule.findOne({business:businessId,key:module,isActive:true}).select("_id")
 ]);

 if(!business)return {status:404,message:"Business not found"};
 if(!department)return {status:404,message:"Department not found"};
 if(String(department.business)!==String(businessId))return {status:400,message:"Department does not belong to this business"};
 if(!permissionModule)return {status:404,message:"Permission page not found or inactive"};
 return {};
};

const populate=query=>query.populate({path:"business",model:Business}).populate({path:"department",model:BusinessDepartment});

export const getDepartmentPermissions=async(req,res)=>{
 try{
  const business=normalizeId(req.query.business);
  const department=normalizeId(req.query.department);
  const query={};
  if(business){if(!mongoose.Types.ObjectId.isValid(business))return res.status(400).json({success:false,message:"Invalid business id"});query.business=business;}
  if(department){if(!mongoose.Types.ObjectId.isValid(department))return res.status(400).json({success:false,message:"Invalid department id"});query.department=department;}
  const data=await populate(DepartmentPermission.find(query).sort({department:1,module:1}));
  return res.json({success:true,count:data.length,data});
 }catch(error){return res.status(500).json({success:false,message:"Failed to load department permissions",error:error.message});}
};

export const createDepartmentPermission=async(req,res)=>{
 try{
  const business=normalizeId(req.body.business);
  const department=normalizeId(req.body.department);
  const module=normalizeModule(req.body.module);
  const validation=await validateScope({businessId:business,departmentId:department,module});
  if(validation.status)return res.status(validation.status).json({success:false,message:validation.message});
  const doc=await DepartmentPermission.create({business,department,module,...normalizePermissions(req.body)});
  return res.status(201).json({success:true,data:await populate(DepartmentPermission.findById(doc._id))});
 }catch(error){
  if(error.code===11000)return res.status(409).json({success:false,message:"Department permission already exists"});
  return res.status(500).json({success:false,message:"Failed to create department permission",error:error.message});
 }
};

export const updateDepartmentPermission=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid department permission id"});
  const doc=await DepartmentPermission.findById(req.params.id);
  if(!doc)return res.status(404).json({success:false,message:"Department permission not found"});
  const business=normalizeId(req.body.business??doc.business);
  const department=normalizeId(req.body.department??doc.department);
  const module=normalizeModule(req.body.module??doc.module);
  const validation=await validateScope({businessId:business,departmentId:department,module});
  if(validation.status)return res.status(validation.status).json({success:false,message:validation.message});
  Object.assign(doc,{business,department,module,...normalizePermissions(req.body)});
  await doc.save();
  return res.json({success:true,data:await populate(DepartmentPermission.findById(doc._id))});
 }catch(error){return res.status(500).json({success:false,message:"Failed to update department permission",error:error.message});}
};

export const deleteDepartmentPermission=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid department permission id"});
  const doc=await DepartmentPermission.findByIdAndDelete(req.params.id);
  if(!doc)return res.status(404).json({success:false,message:"Department permission not found"});
  return res.json({success:true,message:"Department permission deleted"});
 }catch(error){return res.status(500).json({success:false,message:"Failed to delete department permission",error:error.message});}
};
