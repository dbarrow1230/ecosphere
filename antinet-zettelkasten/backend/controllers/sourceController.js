import mongoose from "mongoose";
import Source from "../models/sourceModel.js";
import Zettel from "../models/zettelModel.js";
import RecordSubtype from "../models/recordSubtypeModel.js";
import {generateRecordId,toCode as code} from "../utils/recordId.js";
import {recordRevision} from "../utils/recordRevision.js";

// Helper: return the authenticated or supplied user ID
const getUserId=req=>{
 const userId=req.user?._id||req.query?.userId||req.body?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

// Helper: convert comma-separated or array values into arrays
const normalizeArray=value=>{
 if(Array.isArray(value))return value.map(item=>String(item||"").trim()).filter(Boolean);
 return String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
};

// Helper: keep only valid MongoDB ObjectIds
const normalizeObjectIdArray=value=>{
 if(!Array.isArray(value))return [];

 return value.map(item=>{
  if(typeof item==="string")return item;
  return item?._id||item?.id||item?._id?.$oid||item?.id?.$oid||item?.$oid||"";
 }).filter(item=>mongoose.isValidObjectId(item));
};

// Helper: normalize optional project IDs
const normalizeProjectId=value=>{
 return mongoose.isValidObjectId(value)?value:null;
};

const normalizeProjectIds=value=>[
 ...new Set((Array.isArray(value)?value:[value]).map(item=>normalizeProjectId(typeof item==="object"?(item?._id||item?.id||item?.$oid):item)).filter(Boolean).map(String))
];

// Helper: normalize optional dates
const normalizeDate=value=>{
 if(!value)return null;
 const date=new Date(value);
 return Number.isNaN(date.getTime())?null:date;
};

// Helper: locate the selected Source subtype
const resolveSourceSubtype=async(userId,value)=>{
 const objectId=typeof value==="object"
  ?value?._id||value?.id||value?._id?.$oid||value?.id?.$oid||value?.$oid
  :value;

 const filter={userId,recordType:"SRC",status:"active"};

 if(mongoose.isValidObjectId(objectId))filter._id=objectId;
 else filter.code=code(value?.code||value)||"WEB";

 return RecordSubtype.findOne(filter);
};

// Helper: escape search text before creating a regular expression
const escapeRegex=value=>{
 return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
};

const syncProducedZettels=async({userId,sourceId,producedZettelIds})=>{
 const selectedIds=normalizeObjectIdArray(producedZettelIds);
 await Zettel.updateMany(
  {userId,sourceIds:sourceId,_id:{$nin:selectedIds}},
  {$pull:{sourceIds:sourceId}}
 );
 if(selectedIds.length){
  await Zettel.updateMany(
   {userId,_id:{$in:selectedIds}},
   {$addToSet:{sourceIds:sourceId}}
  );
 }
 return Zettel.find({userId,sourceIds:sourceId})
  .select("zettelId title mainIdea status")
  .sort({title:1});
};

export const getSources=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});

  const {projectId,status,subtype,search}=req.query;
  const filter={userId};

  if(projectId&&mongoose.isValidObjectId(projectId))filter.$or=[{projectId},{projectIds:projectId}];
  if(status)filter.status=status;

  if(subtype){
   const subtypeRecord=await resolveSourceSubtype(userId,subtype);
   if(!subtypeRecord)return res.status(400).json({success:false,message:"Invalid Source type"});
   filter.subtypeId=subtypeRecord._id;
  }

  if(search){
   const searchText=escapeRegex(search);

   filter.$or=[
    {sourceId:{$regex:searchText,$options:"i"}},
    {title:{$regex:searchText,$options:"i"}},
    {subtype:{$regex:searchText,$options:"i"}},
    {author:{$regex:searchText,$options:"i"}},
    {publisher:{$regex:searchText,$options:"i"}},
    {originalUrl:{$regex:searchText,$options:"i"}},
    {archiveType:{$regex:searchText,$options:"i"}},
    {archiveLocation:{$regex:searchText,$options:"i"}},
    {summary:{$regex:searchText,$options:"i"}},
    {copiedText:{$regex:searchText,$options:"i"}},
    {tags:{$regex:searchText,$options:"i"}}
   ];
  }

  const data=await Source.find(filter)
   .populate("subtypeId","recordType name code description status")
   .populate("domainId","name code status")
  .populate("projectId","projectId title code")
   .populate("projectIds","projectId title code")
   .populate("entityIds","entityId name entityType")
   .sort({updatedAt:-1});

  res.json({success:true,data});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getSourceById=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid source ID"});

  const data=await Source.findOne({_id:req.params.id,userId})
   .populate("subtypeId","recordType name code description status")
   .populate("domainId","name code status")
  .populate("projectId","projectId title code")
   .populate("projectIds","projectId title code")
   .populate("entityIds","entityId name entityType");

  if(!data)return res.status(404).json({success:false,message:"Source not found"});

  const producedZettels=await Zettel.find({userId,sourceIds:data._id})
   .select("zettelId title mainIdea status")
   .sort({createdAt:1});

  res.json({success:true,data:{...data.toObject(),producedZettels}});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const createSource=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required to create a source"});

  const projectIds=normalizeProjectIds(req.body.projectIds||req.body.projectId);
  const projectId=normalizeProjectId(req.body.projectId)||projectIds[0]||null;
  const title=String(req.body.title||"").trim();

  if(!title)return res.status(400).json({success:false,message:"Source title is required"});

  const subtypeRecord=await resolveSourceSubtype(userId,req.body.subtypeId||req.body.subtype);
  if(!subtypeRecord)return res.status(400).json({success:false,message:"Select a valid active Source type"});

  const subtype=subtypeRecord.code;

  const sourceId=await generateRecordId({
   userId,
   recordType:"SRC",
   domainId:req.body.domainId,
   projectId,
   projectIds:normalizeProjectIds([projectId,...projectIds]),
   projectCode:req.body.projectCode,
   subtype,
   subject:title
  });

  const data=await Source.create({
   userId,
   domainId:normalizeProjectId(req.body.domainId),
   projectId,
   projectIds,
   sourceId,
   title,
   subtypeId:subtypeRecord._id,
   subtype,
   author:String(req.body.author||"").trim(),
   publisher:String(req.body.publisher||"").trim(),
   libraryBookId:String(req.body.libraryBookId||"").trim(),
   libraryBookUrl:String(req.body.libraryBookUrl||"").trim(),
   originalUrl:String(req.body.originalUrl||"").trim(),
   filePath:String(req.body.filePath||"").trim(),
   accessDate:normalizeDate(req.body.accessDate),
   archiveType:String(req.body.archiveType||"").trim(),
   archiveLocation:String(req.body.archiveLocation||"").trim(),
   copiedText:String(req.body.copiedText||""),
   summary:String(req.body.summary||"").trim(),
   entityIds:normalizeObjectIdArray(req.body.entityIds),
   tags:normalizeArray(req.body.tags),
   status:req.body.status||"active"
  });

  const producedZettels=await syncProducedZettels({
   userId,
   sourceId:data._id,
   producedZettelIds:req.body.producedZettelIds
  });

  res.status(201).json({success:true,data:{...data.toObject(),producedZettels}});
 }catch(error){
  res.status(error.code===11000?409:400).json({
   success:false,
   message:error.code===11000?"That source ID already exists":error.message
  });
 }
};

export const updateSource=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid source ID"});

  const existingSource=await Source.findOne({_id:req.params.id,userId});
  if(!existingSource)return res.status(404).json({success:false,message:"Source not found"});

  const updates={};
  if(Object.prototype.hasOwnProperty.call(req.body,"domainId"))updates.domainId=normalizeProjectId(req.body.domainId);

  if(Object.prototype.hasOwnProperty.call(req.body,"projectId")||Object.prototype.hasOwnProperty.call(req.body,"projectIds")){
   const projectIds=normalizeProjectIds(req.body.projectIds||req.body.projectId);
   updates.projectId=normalizeProjectId(req.body.projectId)||projectIds[0]||null;
   updates.projectIds=normalizeProjectIds([updates.projectId,...projectIds]);
  }

  if(Object.prototype.hasOwnProperty.call(req.body,"title")){
   updates.title=String(req.body.title||"").trim();
   if(!updates.title)return res.status(400).json({success:false,message:"Source title is required"});
  }

  if(
   Object.prototype.hasOwnProperty.call(req.body,"subtypeId")||
   Object.prototype.hasOwnProperty.call(req.body,"subtype")
  ){
   const subtypeRecord=await resolveSourceSubtype(userId,req.body.subtypeId||req.body.subtype);
   if(!subtypeRecord)return res.status(400).json({success:false,message:"Select a valid active Source type"});

   updates.subtypeId=subtypeRecord._id;
   updates.subtype=subtypeRecord.code;
  }

  if(Object.prototype.hasOwnProperty.call(req.body,"author"))updates.author=String(req.body.author||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"publisher"))updates.publisher=String(req.body.publisher||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"libraryBookId"))updates.libraryBookId=String(req.body.libraryBookId||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"libraryBookUrl"))updates.libraryBookUrl=String(req.body.libraryBookUrl||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"originalUrl"))updates.originalUrl=String(req.body.originalUrl||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"filePath"))updates.filePath=String(req.body.filePath||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"accessDate"))updates.accessDate=normalizeDate(req.body.accessDate);
  if(Object.prototype.hasOwnProperty.call(req.body,"archiveType"))updates.archiveType=String(req.body.archiveType||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"archiveLocation"))updates.archiveLocation=String(req.body.archiveLocation||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"copiedText"))updates.copiedText=String(req.body.copiedText||"");
  if(Object.prototype.hasOwnProperty.call(req.body,"summary"))updates.summary=String(req.body.summary||"").trim();
  if(Object.prototype.hasOwnProperty.call(req.body,"entityIds"))updates.entityIds=normalizeObjectIdArray(req.body.entityIds);
  if(Object.prototype.hasOwnProperty.call(req.body,"tags"))updates.tags=normalizeArray(req.body.tags);

  const domainChanged=Object.prototype.hasOwnProperty.call(req.body,"domainId")&&String(updates.domainId||"")!==String(existingSource.domainId||"");
  if(!/-\d{8}-\d{3}$/.test(existingSource.sourceId)||domainChanged){
   updates.sourceId=await generateRecordId({
    userId,
    recordType:"SRC",
    domainId:updates.domainId??existingSource.domainId,
    existingId:existingSource.sourceId,
    recordDate:existingSource.createdAt,
    projectId:updates.projectId??existingSource.projectId,
    subtype:updates.subtype||existingSource.subtype,
    subject:updates.title||existingSource.title
   });
  }
  if(Object.prototype.hasOwnProperty.call(req.body,"status"))updates.status=req.body.status;

  const data=await Source.findOneAndUpdate(
   {_id:req.params.id,userId},
   updates,
   {returnDocument:"after",runValidators:true}
  )
   .populate("subtypeId","recordType name code description status")
   .populate("domainId","name code status")
  .populate("projectId","projectId title code")
   .populate("projectIds","projectId title code")
   .populate("entityIds","entityId name entityType");

  if(!data)return res.status(404).json({success:false,message:"Source not found"});

  const producedZettels=Object.prototype.hasOwnProperty.call(req.body,"producedZettelIds")
   ?await syncProducedZettels({userId,sourceId:data._id,producedZettelIds:req.body.producedZettelIds})
   :await Zettel.find({userId,sourceIds:data._id}).select("zettelId title mainIdea status").sort({title:1});

  await recordRevision({userId,parentModel:"Source",record:data,displayIdFields:["sourceId"],titleFields:["title"],contentFields:["copiedText","summary"]});

  res.json({success:true,data:{...data.toObject(),producedZettels}});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const archiveSource=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid source ID"});

  const data=await Source.findOneAndUpdate(
   {_id:req.params.id,userId},
   {status:"archived"},
   {returnDocument:"after",runValidators:true}
  )
   .populate("subtypeId","recordType name code description status")
   .populate("domainId","name code status")
  .populate("projectId","projectId title code")
   .populate("projectIds","projectId title code")
   .populate("entityIds","entityId name entityType");

  if(!data)return res.status(404).json({success:false,message:"Source not found"});

  res.json({success:true,data});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const deleteSource=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid source ID"});

  const data=await Source.findOneAndDelete({_id:req.params.id,userId});
  if(!data)return res.status(404).json({success:false,message:"Source not found"});

  res.json({success:true,message:"Source deleted"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};
