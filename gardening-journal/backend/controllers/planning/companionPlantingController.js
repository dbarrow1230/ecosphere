import mongoose from "mongoose";
import {loadCompanionLibrary,mergeLibraryCompanions} from "../../services/companionLibrary.js";
import CompanionPlanting from "../../models/planning/companionPlantingModel.js";

const relationships=new Set(["compatible","incompatible","attractor","repellent"]);
const text=value=>typeof value==="string"?value.trim():"";

export function presentCompanionPlanting(record){
 const data=typeof record.toObject==="function"?record.toObject():record;
 return {...data,companions:data.companions?.length?data.companions:data.companion?[{name:data.companion,relationship:data.relationship,source:data.source||"",notes:data.notes||""}]:[]};
}

export function sanitizeCompanionPlanting(body){
 const data={};
 if(body.libraryType!=null||body.libraryId!=null){
  if(!["seed","plant"].includes(body.libraryType)||!mongoose.isValidObjectId(body.libraryId))throw new Error("Select an existing seed or plant from the library");
  data.libraryType=body.libraryType;data.libraryId=body.libraryId;
 }
 if(body.name!==undefined){
  data.name=text(body.name);
  if(!data.name)throw new Error("Plant name is required");
 }
 if(body.notes!==undefined)data.notes=text(body.notes);
 const rows=body.companions!==undefined?body.companions:body.companion!==undefined?[{name:body.companion,relationship:body.relationship,source:body.source,notes:body.notes}]:undefined;
 if(rows!==undefined){
  if(!Array.isArray(rows)||(!rows.length&&!data.libraryId))throw new Error("Add at least one companion plant");
  const seen=new Set();
  data.companions=rows.map((row,index)=>{
   if(!row||typeof row!=="object")throw new Error(`Companion ${index+1} is invalid`);
   const name=text(row.name);
   const relationship=text(row.relationship);
   if(!name)throw new Error(`Companion ${index+1} needs a plant name`);
   if(!relationships.has(relationship))throw new Error(`Choose a relationship for ${name}`);
   const key=`${name.toLowerCase()}:${relationship}`;
   if(seen.has(key))throw new Error(`${name} already has this relationship`);
   seen.add(key);
   return {name,relationship,source:text(row.source),notes:text(row.notes)};
  });
 }
 return data;
}

export async function library(req,res){
 try{res.json(await loadCompanionLibrary());}catch(error){res.status(500).json({message:error.message});}
}

export async function list(req,res){
 try{const [rows,catalog]=await Promise.all([CompanionPlanting.find({}).sort({createdAt:-1}),loadCompanionLibrary()]);res.json(mergeLibraryCompanions(rows.map(presentCompanionPlanting),catalog));}
 catch(error){res.status(500).json({message:error.message});}
}

async function resolveCatalogData(body){
 const data=sanitizeCompanionPlanting(body);
 const catalog=await loadCompanionLibrary();
 if(data.libraryId){
  const entry=catalog.find(item=>item.libraryType===data.libraryType&&item.libraryId===String(data.libraryId));
  if(!entry)throw new Error("The selected plant or seed no longer exists in the library");
  data.name=entry.name;
  if(!entry.companions.length&&!data.companions?.length)throw new Error("Add at least one companion plant");
 }
 return {data,catalog};
}

export async function create(req,res){
 try{
  const {data,catalog}=await resolveCatalogData(req.body);
  if(data.libraryId&&await CompanionPlanting.exists({libraryType:data.libraryType,libraryId:data.libraryId}))return res.status(409).json({message:"This plant already has a companion list. Open its existing list to edit it."});
  const record=await CompanionPlanting.create(data);
  res.status(201).json(mergeLibraryCompanions([presentCompanionPlanting(record)],catalog).find(item=>String(item._id)===String(record._id)));
 }catch(error){res.status(400).json({message:error.message});}
}

export async function update(req,res){
 try{
  const record=await CompanionPlanting.findById(req.params.id);
  if(!record)return res.status(404).json({message:"Companion Relationship not found"});
  const {data,catalog}=await resolveCatalogData({...req.body,libraryType:req.body.libraryType??record.libraryType,libraryId:req.body.libraryId??record.libraryId});
  if(data.libraryId&&await CompanionPlanting.exists({libraryType:data.libraryType,libraryId:data.libraryId,_id:{$ne:record._id}}))return res.status(409).json({message:"This plant already has a companion list."});
  Object.assign(record,data);
  if(req.body.companions!==undefined){record.companion=undefined;record.relationship=undefined;record.source=undefined;}
  await record.save();
  res.json(mergeLibraryCompanions([presentCompanionPlanting(record)],catalog).find(item=>String(item._id)===String(record._id)));
 }catch(error){res.status(400).json({message:error.message});}
}

export async function remove(req,res){
 try{
  const record=await CompanionPlanting.findByIdAndDelete(req.params.id);
  if(!record)return res.status(404).json({message:"Companion Relationship not found"});
  res.json({message:"Companion Relationship deleted"});
 }catch(error){res.status(500).json({message:error.message});}
}
