import ServiceRecord from "../models/serviceRecordModel.js";
import Inventory from "../models/inventoryModel.js";
import Client from "../models/clientModel.js";
import {pick,validId,fail} from "../utils/itmCrud.js";
const fields=["serviceType","systemType","scheduledDate","serviceDate","technician","procedureReference","siteAddress","reason","notes","customerAcknowledgement"];
const itemFields=["equipmentRef","checks","outcome","workPerformed","deficiencies","correctiveAction","partsUsed","tagNumber","nextInspectionDate","nextMaintenanceDate","nextHydrostaticTest"];
const snapshotFields=["name","serialNumber","manufacturer","modelNumber","category","location","agentType","capacity","rating"];
const transitions={draft:["draft","scheduled","in-progress","cancelled"],scheduled:["scheduled","draft","in-progress","cancelled"],"in-progress":["in-progress","completed","cancelled"],completed:[],cancelled:[]};
export const listServices=async(req,res)=>{
 try{const query={};if(req.query.client){if(!validId(req.query.client))return res.status(400).json({message:"Invalid client id."});query.clientRef=req.query.client;}return res.json({records:await ServiceRecord.find(query).populate("clientRef").sort({createdAt:-1}).limit(500).lean()});}catch(error){return fail(res,error);}
};
export const getService=async(req,res)=>{
 try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid service record id."});const record=await ServiceRecord.findById(req.params.id).populate("clientRef").lean();return record?res.json({record}):res.status(404).json({message:"Service record not found."});}catch(error){return fail(res,error);}
};
export const saveService=async(req,res)=>{
 try{
  const updating=!!req.params.id;if(updating&&!validId(req.params.id))return res.status(400).json({message:"Invalid service record id."});
  const record=updating?await ServiceRecord.findById(req.params.id):new ServiceRecord({clientRef:req.body.clientRef,createdBy:req.user?._id});
  if(!record)return res.status(404).json({message:"Service record not found."});
  if(updating&&req.body.__v!==undefined&&req.body.__v!==record.__v)return res.status(409).json({message:"This service record changed. Reload before saving again."});
  if(updating&&["completed","cancelled"].includes(record.status))return res.status(409).json({message:"Closed records are preserved. Create a follow-up record for additional work."});
  if(updating&&req.body.clientRef&&String(req.body.clientRef)!==String(record.clientRef))return res.status(400).json({message:"A service record cannot be moved to another client."});
  const client=await Client.findById(record.clientRef);if(!client)return res.status(400).json({message:"Select an existing client."});
  const status=req.body.status||record.status;if(!transitions[record.status]?.includes(status))return res.status(400).json({message:"Start the service before completing it."});
  const data=pick(req.body,fields);for(const key of ["scheduledDate","serviceDate"])if(data[key]==="")data[key]=null;record.set(data);record.status=status;
  if(req.body.equipment!==undefined){
   if(!Array.isArray(req.body.equipment)||req.body.equipment.length>500)return res.status(400).json({message:"Provide up to 500 equipment records."});
   const ids=req.body.equipment.map(item=>item.equipmentRef);if(ids.some(id=>!validId(id))||new Set(ids).size!==ids.length)return res.status(400).json({message:"Equipment selections must be valid and unique."});
   const equipment=await Inventory.find({_id:{$in:ids},clientRef:record.clientRef,kind:"equipment"}).lean();if(equipment.length!==ids.length)return res.status(400).json({message:"Every selected item must be serialized equipment assigned to this client."});
   record.equipment=req.body.equipment.map(item=>{const result=pick(item,itemFields);for(const field of ["nextInspectionDate","nextMaintenanceDate","nextHydrostaticTest"])if(result[field]==="")result[field]=null;const previous=record.equipment.find(row=>String(row.equipmentRef)===item.equipmentRef);return {...result,snapshot:previous?.snapshot||pick(equipment.find(row=>String(row._id)===item.equipmentRef),snapshotFields)};});
  }
  if(status==="scheduled"&&!record.scheduledDate)return res.status(400).json({message:"A scheduled date is required."});
  if(status==="completed"){
   if(!record.technician||!record.serviceDate||!record.procedureReference||!record.equipment.length)return res.status(400).json({message:"Completion requires a technician, service date, procedure reference, and equipment results."});
   if(record.equipment.some(item=>item.outcome==="pending"||!item.checks.length||item.checks.some(check=>check.result==="pending")))return res.status(400).json({message:"Record an outcome and complete the checks for every item."});
   if(record.equipment.some(item=>(["fail","needs-service","replaced","retired"].includes(item.outcome)||item.checks.some(check=>check.result==="fail"))&&!item.deficiencies.trim()))return res.status(400).json({message:"Describe deficiencies or the reason for replacement/retirement."});
   if(record.equipment.some(item=>item.outcome==="pass"&&item.checks.some(check=>check.result==="fail")))return res.status(400).json({message:"An item with a failed check cannot have a passing outcome."});
   record.completedAt=new Date();
  }
  await record.save();return res.status(updating?200:201).json({record:await ServiceRecord.findById(record._id).populate("clientRef").lean()});
 }catch(error){return fail(res,error);}
};
