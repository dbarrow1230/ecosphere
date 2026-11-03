// backend/controllers/studies/studyController.js
import Study from "../../models/studies/studyModel.js";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(value._id)return value._id;
 return value;
};

const slugify=value=>String(value||"")
 .toLowerCase()
 .trim()
 .replace(/[^a-z0-9\s-]/g,"")
 .replace(/\s+/g,"-")
 .replace(/-+/g,"-");

const normalizeScriptureExplorer=value=>{
 const source=value&&typeof value==="object"?value:{};
 const sections=Array.isArray(source.sections)?source.sections:[];

 return{
  reference:String(source.reference||""),
  passageText:String(source.passageText||""),
  sections:sections.map((section,index)=>({
   title:String(section?.title||""),
   content:String(section?.content||""),
   order:Number(section?.order)||index+1
  }))
 };
};

const normalizeStudyPayload=body=>{
 const payload={...body};
 const incomingMethods=Array.isArray(payload.methods)
  ?payload.methods
  :payload.methods?[payload.methods]:[];
 const legacyMethod=getObjectId(payload.method);
 const methods=[...new Set([...incomingMethods.map(getObjectId),legacyMethod].filter(Boolean))];

 payload.methods=methods;
 payload.method=methods[0]||null;
 payload.methodWorkspaces=(Array.isArray(payload.methodWorkspaces)?payload.methodWorkspaces:[]).map(workspace=>({
  ...workspace,
  method:getObjectId(workspace?.method)||null
 }));
 payload.slug=slugify(payload.slug||payload.title);
 payload.scriptureExplorer=normalizeScriptureExplorer(payload.scriptureExplorer);

 return payload;
};

const getSaveErrorMessage=err=>{
 if(err?.code===11000){
  const field=Object.keys(err.keyPattern||err.keyValue||{})[0]||"field";
  return `A study with that ${field} already exists.`;
 }

 if(err?.name==="ValidationError"){
  return Object.values(err.errors||{}).map(error=>error.message).filter(Boolean).join(" ")||err.message;
 }

 return err?.message||"Unable to save study.";
};

const resolveUniqueSlug=async(payload,excludeId=null)=>{
 const baseSlug=slugify(payload.slug||payload.title)||"study";
 let nextSlug=baseSlug;
 let suffix=2;

 while(true){
  const filter={slug:nextSlug};
  if(excludeId)filter._id={$ne:excludeId};
  const existing=await Study.exists(filter);
  if(!existing)return nextSlug;
  nextSlug=`${baseSlug}-${suffix}`;
  suffix+=1;
 }
};

export const getStudies=async(req,res)=>{
 try{
  const {user,method,category,status}=req.query;
  const filter={};

  if(user)filter.user=user;
  if(method)filter.$or=[{method},{methods:method}];
  if(category)filter.category=category;
  if(status)filter.status=status;

  const items=await Study.find(filter)
   .populate("user")
   .populate("method")
   .populate("methods")
   .populate("methodWorkspaces.method")
   .populate("category")
   .populate("difficulty")
   .populate("status")
   .sort({createdAt:-1});

  return res.status(200).json({
   success:true,
   count:items.length,
   data:items
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch studies",
   error:err.message
  });
 }
};

export const getStudyById=async(req,res)=>{
 try{
  const item=await Study.findById(req.params.id)
   .populate("user")
   .populate("method")
   .populate("methods")
   .populate("methodWorkspaces.method")
   .populate("category")
   .populate("difficulty")
   .populate("status");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch study",
   error:err.message
  });
 }
};

export const createStudy=async(req,res)=>{
 try{
  const payload=normalizeStudyPayload(req.body);
  payload.slug=await resolveUniqueSlug(payload);

  const item=await Study.create(payload);
  const populatedItem=await Study.findById(item._id)
   .populate("user")
   .populate("method")
   .populate("methods")
   .populate("methodWorkspaces.method")
   .populate("category")
   .populate("difficulty")
   .populate("status");

  return res.status(201).json({
   success:true,
   message:"Study created successfully",
   data:populatedItem
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:getSaveErrorMessage(err),
   error:err.message
  });
 }
};

export const updateStudy=async(req,res)=>{
 try{
  const payload=normalizeStudyPayload(req.body);
  payload.slug=await resolveUniqueSlug(payload,req.params.id);

  const item=await Study.findByIdAndUpdate(req.params.id,payload,{
   returnDocument:"after",
   runValidators:true
  })
   .populate("user")
   .populate("method")
   .populate("methods")
   .populate("methodWorkspaces.method")
   .populate("category")
   .populate("difficulty")
   .populate("status");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study updated successfully",
   data:item
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:getSaveErrorMessage(err),
   error:err.message
  });
 }
};

export const deleteStudy=async(req,res)=>{
 try{
  const item=await Study.findByIdAndDelete(req.params.id);

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Study not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Study deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete study",
   error:err.message
  });
 }
};
