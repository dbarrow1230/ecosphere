import mongoose from "mongoose";

const invalid=message=>Object.assign(new Error(message),{status:400});
export const idOf=value=>typeof value==="string"?value:value?._id?.toString()||"";
export const isId=value=>typeof value==="string"&&mongoose.isObjectIdOrHexString(value);
export const fail=(res,error)=>res.status(error.status||(["ValidationError","CastError"].includes(error.name)?400:error.code===11000?409:500)).json({message:error.code===11000?"A record with this name already exists.":error.status||["ValidationError","CastError"].includes(error.name)?error.message:"Unable to complete this request."});

// Shared request mechanics only; each controller declares its own model and fields.
export const resourceController=({Model,fields,populate=[],references={},filter=()=>({}),validate=()=>{},beforeDelete=async()=>{}})=>{
 const payloadFor=async(req,existing)=>{
  const payload={};
  for(const field of fields){if(Object.hasOwn(req.body||{},field))payload[field]=req.body[field];}
  for(const [field,definition] of Object.entries(references)){
   if(!Object.hasOwn(payload,field))continue;
   const {model,many=false,where={}}=definition;
   const value=payload[field];
   if(many&&!Array.isArray(value))throw invalid(`${field} must be a list.`);
   const values=many?value:value?[value]:[];
   if(values.some(item=>!isId(item)))throw invalid(`Invalid selection for ${field}.`);
   const ids=[...new Set(values)];
   if(ids.length&&await model.countDocuments({_id:{$in:ids},owner:req.user._id,...where})!==ids.length)throw invalid(`The selected ${field} record is unavailable.`);
   payload[field]=many?ids:ids[0]||null;
  }
  await validate({...existing?.toObject(),...payload});
  return payload;
 };
 const findOwned=req=>Model.findOne({_id:req.params.id,owner:req.user._id});
 return {
  list:async(req,res)=>{try{
   const query={owner:req.user._id,...filter(req)};
   const page=Math.max(1,parseInt(req.query.page,10)||1);
   const limit=Math.min(200,Math.max(1,parseInt(req.query.limit,10)||100));
   const [data,total]=await Promise.all([Model.find(query).populate(populate).sort({createdAt:-1}).skip((page-1)*limit).limit(limit),Model.countDocuments(query)]);
   res.json({data,total,page,limit});
  }catch(error){fail(res,error);}},
  get:async(req,res)=>{try{
   if(!isId(req.params.id))throw invalid("Invalid record id.");
   const record=await findOwned(req).populate(populate);
   if(!record)return res.status(404).json({message:"Record not found."});
   res.json({data:record});
  }catch(error){fail(res,error);}},
  create:async(req,res)=>{try{
   const payload=await payloadFor(req);
   const record=await Model.create({...payload,owner:req.user._id});
   await record.populate(populate);
   res.status(201).json({data:record});
  }catch(error){fail(res,error);}},
  update:async(req,res)=>{try{
   if(!isId(req.params.id))throw invalid("Invalid record id.");
   const record=await findOwned(req);
   if(!record)return res.status(404).json({message:"Record not found."});
   record.set(await payloadFor(req,record));
   await record.save();
   await record.populate(populate);
   res.json({data:record});
  }catch(error){fail(res,error);}},
  remove:async(req,res)=>{try{
   if(!isId(req.params.id))throw invalid("Invalid record id.");
   const record=await findOwned(req);
   if(!record)return res.status(404).json({message:"Record not found."});
   await beforeDelete(record,req);
   await record.deleteOne();
   res.json({message:"Record deleted."});
  }catch(error){fail(res,error);}}
 };
};
export const requireUnused=async(Model,query)=>{
 if(await Model.exists(query))throw Object.assign(new Error("This record is still in use. Remove its links before deleting it."),{status:409});
};
