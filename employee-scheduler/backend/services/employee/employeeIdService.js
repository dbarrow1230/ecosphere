// backend/services/employeeIdService.js
import Counter from "../../models/counterModel.js";
import Business from "../models/business/businessModel.js";
import Employee from "../../models/employee/employeeModel.js";

const padNumber=(value,length=5)=>String(value).padStart(length,"0");

const normalizeBusinessCode=(value="")=>{
 return String(value||"")
  .trim()
  .toUpperCase()
  .replace(/[^A-Z0-9]/g,"");
};

export const getBusinessCodeOrThrow=async(businessId)=>{
 const business=await Business.findById(businessId).select("code legalName");

 if(!business)throw new Error("Business not found.");

 const businessCode=normalizeBusinessCode(business.code);

 if(!businessCode)throw new Error("Business code is required before generating employee IDs.");

 return businessCode;
};

export const getNextEmployeeSequence=async(businessId)=>{
 const counter=await Counter.findOneAndUpdate(
  {business:businessId,type:"employee"},
  {$inc:{seq:1}},
  {returnDocument:"after",upsert:true,setDefaultsOnInsert:true}
 );

 if(!counter)throw new Error("Failed to generate employee sequence.");

 if(Number(counter.seq||0)>99999)throw new Error("Employee ID limit reached for this business.");

 return Number(counter.seq||0);
};

export const buildEmployeeId=(businessCode,sequence)=>{
 const cleanBusinessCode=normalizeBusinessCode(businessCode);
 const serial=padNumber(sequence,5);
 return `${cleanBusinessCode}-${serial}`;
};

export const generateEmployeeId=async(businessId)=>{
 const businessCode=await getBusinessCodeOrThrow(businessId);
 const sequence=await getNextEmployeeSequence(businessId);
 return buildEmployeeId(businessCode,sequence);
};

export const assignGeneratedEmployeeId=async(employeePayload={})=>{
 if(!employeePayload?.business)throw new Error("Business is required to generate employee ID.");

 if(employeePayload.employeeId)return employeePayload;

 const employeeId=await generateEmployeeId(employeePayload.business);

 return {
  ...employeePayload,
  employeeId
 };
};

export const ensureUniqueEmployeeIdOrThrow=async({business,employeeId,excludeEmployeeId=null})=>{
 if(!business)throw new Error("Business is required.");
 if(!employeeId)throw new Error("Employee ID is required.");

 const existing=await Employee.findOne({
  business,
  employeeId,
  ...(excludeEmployeeId?{_id:{$ne:excludeEmployeeId}}:{})
 }).select("_id");

 if(existing)throw new Error("Employee ID already exists for this business.");

 return true;
};

export default {
 getBusinessCodeOrThrow,
 getNextEmployeeSequence,
 buildEmployeeId,
 generateEmployeeId,
 assignGeneratedEmployeeId,
 ensureUniqueEmployeeIdOrThrow
};