import mongoose from "mongoose";
export const validId=value=>typeof value==="string"&&mongoose.isObjectIdOrHexString(value);
export const pick=(source,fields)=>Object.fromEntries(fields.filter(key=>source?.[key]!==undefined).map(key=>[key,source[key]]));
export const escapeSearch=value=>String(value||"").trim().slice(0,100).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
export const fail=(res,error)=>res.status(error.code===11000||error.name==="VersionError"?409:error.name==="ValidationError"||error.name==="CastError"?400:500).json({message:error.code===11000?"That serial number or record already exists.":error.name==="VersionError"?"This record changed. Reload before saving again.":error.name==="ValidationError"||error.name==="CastError"?error.message:"Unable to complete the request."});
