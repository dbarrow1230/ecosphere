import mongoose from "mongoose";
import Client from "../../models/operations/clientModel.js";
import Country from "../../models/locations/countryModel.js";
import State from "../../models/locations/stateModel.js";

const fields=["name","firstName","lastName","company","email","phone","altPhone","address1","address2","city","state","country","postalCode","notes","status"];
const pick=body=>Object.fromEntries(fields.filter(field=>body[field]!==undefined).map(field=>[field,body[field]]));
const validId=id=>mongoose.Types.ObjectId.isValid(id);

const attachLocations=async records=>{
 const list=Array.isArray(records)?records:[records];
 const plain=list.map(record=>record?.toObject?record.toObject():record);
 const countryIds=[...new Set(plain.map(item=>String(item?.country||"")).filter(validId))];
 const stateIds=[...new Set(plain.map(item=>String(item?.state||"")).filter(validId))];
 const [countries,states]=await Promise.all([Country.find({_id:{$in:countryIds}}).lean(),State.find({_id:{$in:stateIds}}).lean()]);
 const countryMap=new Map(countries.map(item=>[String(item._id),item]));
 const stateMap=new Map(states.map(item=>[String(item._id),item]));
 const result=plain.map(item=>({...item,country:countryMap.get(String(item.country))||item.country,state:stateMap.get(String(item.state))||item.state}));
 return Array.isArray(records)?result:result[0];
};

export const getClients=async(req,res,next)=>{try{const clients=await Client.find(req.query.status?{status:req.query.status}:{}).sort({createdAt:-1});res.json({clients:await attachLocations(clients)});}catch(error){next(error);}};
export const getClientById=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid client id"});const client=await Client.findById(req.params.id);if(!client)return res.status(404).json({message:"Client not found"});res.json({client:await attachLocations(client)});}catch(error){next(error);}};
export const createClient=async(req,res,next)=>{try{const client=await Client.create(pick(req.body));res.status(201).json({message:"Client created successfully",client:await attachLocations(client)});}catch(error){next(error);}};
export const updateClient=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid client id"});const client=await Client.findByIdAndUpdate(req.params.id,pick(req.body),{returnDocument:"after",runValidators:true});if(!client)return res.status(404).json({message:"Client not found"});res.json({message:"Client updated successfully",client:await attachLocations(client)});}catch(error){next(error);}};
export const deleteClient=async(req,res,next)=>{try{if(!validId(req.params.id))return res.status(400).json({message:"Invalid client id"});const client=await Client.findByIdAndDelete(req.params.id);if(!client)return res.status(404).json({message:"Client not found"});res.json({message:"Client deleted successfully"});}catch(error){next(error);}};
