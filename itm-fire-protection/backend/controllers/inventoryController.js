import Inventory from "../models/inventoryModel.js";
import Client from "../models/clientModel.js";
import ServiceRecord from "../models/serviceRecordModel.js";
import {pick,validId,escapeSearch,fail} from "../utils/itmCrud.js";
import inventoryServiceState from "../utils/inventoryServiceState.js";
const fields=["name","kind","category","sku","clientRef","serialNumber","manufacturer","modelNumber","agentType","capacity","rating","location","quantityOnHand","unit","reorderLevel","costPerUnit","supplier","manufactureDate","installDate","lastInspectionDate","lastServiceDate","lastHydrostaticTest","nextInspectionDate","nextMaintenanceDate","nextHydrostaticTest","status","notes"];
const payload=body=>{const row=pick(body,fields);for(const key of fields)if((key.endsWith("Date")||key.endsWith("Test")||key==="clientRef")&&row[key]==="")row[key]=null;return row;};
export const listInventory=async(req,res)=>{
 try{const query={},search=escapeSearch(req.query.search);if(req.query.client){if(!validId(req.query.client))return res.status(400).json({message:"Invalid client id."});query.clientRef=req.query.client;}if(search)query.$or=["name","serialNumber","sku","manufacturer","modelNumber","location"].map(key=>({[key]:{$regex:search,$options:"i"}}));return res.json({items:await inventoryServiceState(await Inventory.find(query).populate("clientRef").sort({name:1,serialNumber:1}).limit(1000).lean())});}catch(error){return fail(res,error);}
};
export const getInventory=async(req,res)=>{
 try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid equipment id."});const item=await Inventory.findById(req.params.id).populate("clientRef").lean();return item?res.json({item}):res.status(404).json({message:"Equipment not found."});}catch(error){return fail(res,error);}
};
export const saveInventory=async(req,res)=>{
 try{
  const updating=!!req.params.id;if(updating&&!validId(req.params.id))return res.status(400).json({message:"Invalid equipment id."});
  const row=updating?await Inventory.findById(req.params.id):new Inventory();if(!row)return res.status(404).json({message:"Equipment not found."});const next=payload(req.body);
  if(next.clientRef&&!await Client.exists({_id:next.clientRef}))return res.status(400).json({message:"Select an existing client."});
  if(updating&&next.clientRef!==undefined&&String(next.clientRef||"")!==String(row.clientRef||"")&&await ServiceRecord.exists({"equipment.equipmentRef":row._id,status:{$in:["draft","scheduled","in-progress"]}}))return res.status(409).json({message:"Complete or cancel open service records before transferring equipment."});
  row.set(next);await row.save();return res.status(updating?200:201).json({item:await Inventory.findById(row._id).populate("clientRef").lean()});
 }catch(error){return fail(res,error);}
};
export const retireInventory=async(req,res)=>{req.body={status:"retired"};return saveInventory(req,res);};
