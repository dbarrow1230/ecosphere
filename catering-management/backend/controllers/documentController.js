import Document from "../models/documentModel.js";

export const getDocuments=async(req,res)=>{
 try{
  const docs=await Document.find().populate("client event order invoice");
  res.json({success:true,data:docs});
 }catch(err){
  res.status(500).json({success:false,message:err.message});
 }
};

export const getDocumentById=async(req,res)=>{
 try{
  const doc=await Document.findById(req.params.id).populate("client event order invoice");
  if(!doc){return res.status(404).json({success:false,message:"Document not found"});}
  res.json({success:true,data:doc});
 }catch(err){
  res.status(500).json({success:false,message:err.message});
 }
};

export const createDocument=async(req,res)=>{
 try{
  const doc=new Document(req.body);
  const saved=await doc.save();
  res.status(201).json({success:true,data:saved});
 }catch(err){
  res.status(400).json({success:false,message:err.message});
 }
};

export const updateDocument=async(req,res)=>{
 try{
  const doc=await Document.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!doc){return res.status(404).json({success:false,message:"Document not found"});}
  res.json({success:true,data:doc});
 }catch(err){
  res.status(400).json({success:false,message:err.message});
 }
};

export const deleteDocument=async(req,res)=>{
 try{
  const doc=await Document.findByIdAndDelete(req.params.id);
  if(!doc){return res.status(404).json({success:false,message:"Document not found"});}
  res.json({success:true,message:"Document deleted"});
 }catch(err){
  res.status(500).json({success:false,message:err.message});
 }
};