import Client from "../models/clientModel.js";
import Inventory from "../models/inventoryModel.js";
import ServiceRecord from "../models/serviceRecordModel.js";
import State from "../models/locations/stateModel.js";
import Country from "../models/locations/countryModel.js";
import {pick,validId,escapeSearch,fail} from "../utils/itmCrud.js";
import inventoryServiceState from "../utils/inventoryServiceState.js";

const fields=["name","firstName","lastName","company","email","phone","altPhone","address1","address2","city","state","country","postalCode","notes","status","propertyName","propertyType","siteContact","accessInstructions"];
const populate=query=>query.populate({path:"state",model:State,skipInvalidIds:true}).populate({path:"country",model:Country,skipInvalidIds:true});
const payload=body=>{const result=pick(body,fields);for(const key of ["state","country"])if(result[key]==="")result[key]=null;return result;};
export const listClients=async(req,res)=>{
 try{
  const search=escapeSearch(req.query.search),query={};
  if(search){const equipment=await Inventory.find({serialNumber:{$regex:search,$options:"i"},clientRef:{$ne:null}}).select("clientRef").lean();query.$or=[...['name','firstName','lastName','company','email','phone','address1','propertyName'].map(field=>({[field]:{$regex:search,$options:"i"}})),{_id:{$in:equipment.map(row=>row.clientRef)}}];}
  return res.json({clients:await populate(Client.find(query)).sort({name:1}).limit(500).lean()});
 }catch(error){return fail(res,error);}
};
export const getClient=async(req,res)=>{
 try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid client id."});const client=await populate(Client.findById(req.params.id)).lean();return client?res.json({client}):res.status(404).json({message:"Client not found."});}catch(error){return fail(res,error);}
};
export const clientOverview=async(req,res)=>{
 try{
  if(!validId(req.params.id))return res.status(400).json({message:"Invalid client id."});
  const client=await populate(Client.findById(req.params.id)).lean();if(!client)return res.status(404).json({message:"Client not found."});
  const [equipment,services]=await Promise.all([Inventory.find({clientRef:client._id}).sort({location:1,serialNumber:1}).lean(),ServiceRecord.find({clientRef:client._id}).sort({createdAt:-1}).lean()]);
  return res.json({client,equipment:await inventoryServiceState(equipment),services});
 }catch(error){return fail(res,error);}
};
export const createClient=async(req,res)=>{try{const row=await Client.create(payload(req.body));return res.status(201).json({client:await populate(Client.findById(row._id)).lean()});}catch(error){return fail(res,error);}};
export const updateClient=async(req,res)=>{
 try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid client id."});const row=await Client.findById(req.params.id);if(!row)return res.status(404).json({message:"Client not found."});row.set(payload(req.body));await row.save();return res.json({client:await populate(Client.findById(row._id)).lean()});}catch(error){return fail(res,error);}
};
