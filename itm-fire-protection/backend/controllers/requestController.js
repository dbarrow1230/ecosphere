import Request from "../models/requestModel.js";

const fields=["kind","company","name","phone","email","address","property","service","equipment","quantity","details","subject","message"];
export const createRequest=async(req,res)=>{
 try{
  const payload=Object.fromEntries(fields.filter(key=>req.body?.[key]!==undefined).map(key=>[key,req.body[key]]));
  if(payload.quantity==="")delete payload.quantity;
  const row=await Request.create(payload);
  return res.status(201).json({id:row._id,status:row.status,message:"Your request has been saved."});
 }catch(error){return res.status(error.name==="ValidationError"?400:500).json({message:error.name==="ValidationError"?error.message:"Unable to save your request. Please try again."});}
};
export const getRequests=async(req,res)=>{
 try{return res.json(await Request.find().sort({createdAt:-1}).limit(200).lean());}
 catch{return res.status(500).json({message:"Unable to load requests."});}
};
export const updateRequest=async(req,res)=>{
 try{
  if(!["new","reviewing","closed"].includes(req.body?.status))return res.status(400).json({message:"Invalid request status."});
  const row=await Request.findByIdAndUpdate(req.params.id,{status:req.body.status},{returnDocument:"after",runValidators:true}).lean();
  return row?res.json(row):res.status(404).json({message:"Request not found."});
 }catch(error){return res.status(error.name==="CastError"?400:500).json({message:"Unable to update request."});}
};
