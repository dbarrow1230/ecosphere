import mongoose from "mongoose";
import Zettel from "../models/zettelModel.js";
import RecordSubtype from "../models/recordSubtypeModel.js";
import {generateRecordId,toSubjectCode} from "../utils/recordId.js";
import {recordRevision} from "../utils/recordRevision.js";

const getUserId=req=>{
 const userId=req.user?._id||req.body?.userId||req.query?.userId||"";
 return mongoose.isValidObjectId(userId)?userId:"";
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value._id?.$oid||value.id?.$oid||value._id||value.id||value.$oid||"";
};

const normalizeObjectId=value=>{
 const objectId=getObjectId(value);
 return mongoose.isValidObjectId(objectId)?objectId:null;
};

const normalizeObjectIdArray=value=>{
 const values=Array.isArray(value)?value:String(value||"").split(",");
 return values.map(getObjectId).filter(item=>mongoose.isValidObjectId(item));
};

const normalizeStringArray=value=>{
 if(Array.isArray(value))return value.map(item=>String(item||"").trim()).filter(Boolean);
 return String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
};

const normalizeBoolean=value=>value===true||value==="true"||value===1||value==="1"||value==="on";
const escapeRegex=value=>String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

const resolveSubtype=async(userId,value,activeOnly=true)=>{
 const objectId=getObjectId(value);
 const code=String(value?.code||value||"").trim().toUpperCase();
 const filter={userId,recordType:"ZTL"};

 if(activeOnly)filter.status="active";

 if(mongoose.isValidObjectId(objectId))filter._id=objectId;
 else if(code)filter.code=code;
 else return null;

 return RecordSubtype.findOne(filter);
};

const resolveSubtypes=async(userId,value,activeOnly=true)=>{
 const values=Array.isArray(value)?value:[value];
 const records=await Promise.all(values.filter(Boolean).map(item=>resolveSubtype(userId,item,activeOnly)));
 if(!records.length||records.some(record=>!record))return [];
 return [...new Map(records.map(record=>[String(record._id),record])).values()];
};

const buildZettelPayload=(body,partial=false)=>{
 const payload={};
 if(!partial||Object.prototype.hasOwnProperty.call(body,"domainId"))payload.domainId=normalizeObjectId(body.domainId);

 if(!partial||Object.prototype.hasOwnProperty.call(body,"projectIds")||Object.prototype.hasOwnProperty.call(body,"projectId")){
  const requestedProjects=normalizeObjectIdArray(body.projectIds);
  const legacyProject=normalizeObjectId(body.projectId);
  payload.projectIds=[...new Set([...requestedProjects,...(legacyProject?[String(legacyProject)]:[])])];
  payload.projectId=payload.projectIds[0]||null;
 }
 if(!partial||Object.prototype.hasOwnProperty.call(body,"subjectCode"))payload.subjectCode=String(body.subjectCode||"").trim().toUpperCase();
 if(!partial||Object.prototype.hasOwnProperty.call(body,"idSubtype"))payload.idSubtype=String(body.idSubtype||"").trim().toUpperCase();
 if(!partial||Object.prototype.hasOwnProperty.call(body,"title"))payload.title=String(body.title||"").trim();
 if(!partial||Object.prototype.hasOwnProperty.call(body,"mainIdea"))payload.mainIdea=String(body.mainIdea||"").trim();
 if(!partial||Object.prototype.hasOwnProperty.call(body,"body"))payload.body=String(body.body||"");
 if(!partial||Object.prototype.hasOwnProperty.call(body,"sourceIds"))payload.sourceIds=normalizeObjectIdArray(body.sourceIds);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"entityIds"))payload.entityIds=normalizeObjectIdArray(body.entityIds);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"originFleetingNoteId"))payload.originFleetingNoteId=normalizeObjectId(body.originFleetingNoteId);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"futureUse"))payload.futureUse=normalizeStringArray(body.futureUse);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"questions"))payload.questions=normalizeStringArray(body.questions);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"needsResearchQuestions"))payload.needsResearchQuestions=normalizeStringArray(body.needsResearchQuestions);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"researchedQuestions"))payload.researchedQuestions=normalizeStringArray(body.researchedQuestions);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"tags"))payload.tags=normalizeStringArray(body.tags);
 if(!partial||Object.prototype.hasOwnProperty.call(body,"status"))payload.status=body.status||"draft";
 if(!partial||Object.prototype.hasOwnProperty.call(body,"isFavorite"))payload.isFavorite=normalizeBoolean(body.isFavorite);

 return payload;
};

const populateZettel=query=>{
 return query
  .populate("domainId","name code status")
  .populate("projectId","projectId title code")
  .populate("projectIds","projectId title code")
  .populate("subtype","recordType name code description status")
  .populate("sourceIds","sourceId title subtype status")
  .populate("entityIds","entityId name entityType status")
  .populate("originFleetingNoteId","fleetingNoteId rawCapture captureType status");
};

export const getZettels=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});

  const {projectId,subtype,status,search,isFavorite}=req.query;
  const filter={userId};

  if(projectId){
   if(!mongoose.isValidObjectId(projectId))return res.status(400).json({success:false,message:"Invalid project ID"});
   filter.$and=[{$or:[{projectIds:projectId},{projectId}]}];
  }

  if(subtype){
   const subtypeRecord=await resolveSubtype(userId,subtype,false);
   if(!subtypeRecord)return res.status(400).json({success:false,message:"Invalid zettel subtype"});
   filter.subtype=subtypeRecord._id;
  }

  if(status)filter.status=status;
  if(isFavorite==="true")filter.isFavorite=true;
  if(isFavorite==="false")filter.isFavorite=false;

  if(search){
   const searchText=escapeRegex(search);

   const subtypeRecords=await RecordSubtype.find({
    userId,
    recordType:"ZTL",
    $or:[
     {name:{$regex:searchText,$options:"i"}},
     {code:{$regex:searchText,$options:"i"}},
     {description:{$regex:searchText,$options:"i"}}
    ]
   }).select("_id");

   filter.$or=[
    {zettelId:{$regex:searchText,$options:"i"}},
    {title:{$regex:searchText,$options:"i"}},
    {mainIdea:{$regex:searchText,$options:"i"}},
    {body:{$regex:searchText,$options:"i"}},
    {futureUse:{$regex:searchText,$options:"i"}},
    {questions:{$regex:searchText,$options:"i"}},
    {tags:{$regex:searchText,$options:"i"}},
    {subtype:{$in:subtypeRecords.map(record=>record._id)}}
   ];
  }

  const zettels=await populateZettel(Zettel.find(filter)).sort({updatedAt:-1});
  res.json({success:true,data:zettels});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const getZettelById=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid zettel ID"});

  const zettel=await populateZettel(Zettel.findOne({_id:req.params.id,userId}));
  if(!zettel)return res.status(404).json({success:false,message:"Zettel not found"});

  res.json({success:true,data:zettel});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const createZettel=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required to create a zettel"});

  const payload=buildZettelPayload(req.body);

  if(!payload.title)return res.status(400).json({success:false,message:"Zettel title is required"});
  if(!payload.mainIdea)return res.status(400).json({success:false,message:"Main idea is required"});

  const subtypes=await resolveSubtypes(userId,req.body.subtype);
  if(!subtypes.length)return res.status(400).json({success:false,message:"At least one valid active zettel subtype is required"});

  payload.subtype=subtypes.map(subtype=>subtype._id);
  const idSubtype=subtypes.find(subtype=>subtype.code===payload.idSubtype)||subtypes[0];
  payload.idSubtype=idSubtype.code;
  payload.subjectCode=toSubjectCode(req.body.subjectCode)||toSubjectCode(payload.title);

  const zettelId=await generateRecordId({
   userId,
   recordType:"ZTL",
   domainId:payload.domainId,
   projectId:payload.projectId,
   projectIds:payload.projectIds,
   subtype:idSubtype.code,
   subject:payload.title,
   subjectCode:payload.subjectCode
  });

  let zettel=await Zettel.create({...payload,userId,zettelId});
  zettel=await populateZettel(Zettel.findById(zettel._id));

  res.status(201).json({success:true,data:zettel});
 }catch(error){
  res.status(error.code===11000?409:400).json({
   success:false,
   message:error.code===11000?"That zettel ID already exists":error.message
  });
 }
};

export const updateZettel=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid zettel ID"});

  const existingZettel=await Zettel.findOne({_id:req.params.id,userId});
  if(!existingZettel)return res.status(404).json({success:false,message:"Zettel not found"});

  const updates=buildZettelPayload(req.body,true);
  let resolvedSubtypes=[];

  if(Object.prototype.hasOwnProperty.call(updates,"title")&&!updates.title){
   return res.status(400).json({success:false,message:"Zettel title is required"});
  }

  if(Object.prototype.hasOwnProperty.call(updates,"mainIdea")&&!updates.mainIdea){
   return res.status(400).json({success:false,message:"Main idea is required"});
  }

  if(Object.prototype.hasOwnProperty.call(req.body,"subtype")){
   resolvedSubtypes=await resolveSubtypes(userId,req.body.subtype);
   if(!resolvedSubtypes.length)return res.status(400).json({success:false,message:"At least one valid active zettel subtype is required"});
   updates.subtype=resolvedSubtypes.map(subtype=>subtype._id);
   const idSubtype=resolvedSubtypes.find(subtype=>subtype.code===String(req.body.idSubtype||"").toUpperCase())||resolvedSubtypes[0];
   updates.idSubtype=idSubtype.code;
  }

  if(Object.prototype.hasOwnProperty.call(updates,"title")&&!Object.prototype.hasOwnProperty.call(req.body,"subjectCode")){
   updates.subjectCode=toSubjectCode(updates.title);
  }

  const domainChanged=Object.prototype.hasOwnProperty.call(req.body,"domainId")&&String(updates.domainId||"")!==String(existingZettel.domainId||"");
  const idSubtypeChanged=Object.prototype.hasOwnProperty.call(req.body,"idSubtype")&&String(updates.idSubtype||"")!==String(existingZettel.idSubtype||"");
  const subjectCodeChanged=Object.prototype.hasOwnProperty.call(updates,"subjectCode")&&String(updates.subjectCode||"")!==String(existingZettel.subjectCode||"");
  if(!/-\d{8}-\d{3}$/.test(existingZettel.zettelId)||domainChanged||idSubtypeChanged||subjectCodeChanged){
   if(!resolvedSubtypes.length){
    resolvedSubtypes=await RecordSubtype.find({_id:{$in:existingZettel.subtype},userId}).lean();
   }
   updates.zettelId=await generateRecordId({
    userId,
    recordType:"ZTL",
    domainId:updates.domainId??existingZettel.domainId,
    existingId:existingZettel.zettelId,
    recordDate:existingZettel.createdAt,
    projectId:updates.projectId??existingZettel.projectId,
    subtype:updates.idSubtype||existingZettel.idSubtype||resolvedSubtypes[0]?.code||"GENERAL",
    subjectCode:updates.subjectCode||existingZettel.subjectCode,
    subject:updates.title||existingZettel.title
   });
  }

  const zettel=await populateZettel(
   Zettel.findOneAndUpdate(
    {_id:req.params.id,userId},
    updates,
    {returnDocument:"after",runValidators:true}
   )
  );

  if(!zettel)return res.status(404).json({success:false,message:"Zettel not found"});
  await recordRevision({userId,parentModel:"Zettel",record:zettel,displayIdFields:["zettelId"],titleFields:["title"],contentFields:["mainIdea","body"]});
  res.json({success:true,data:zettel});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const archiveZettel=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid zettel ID"});

  const zettel=await populateZettel(
   Zettel.findOneAndUpdate(
    {_id:req.params.id,userId},
    {status:"archived"},
    {returnDocument:"after",runValidators:true}
   )
  );

  if(!zettel)return res.status(404).json({success:false,message:"Zettel not found"});
  res.json({success:true,data:zettel});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const toggleFavoriteZettel=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid zettel ID"});

  const existingZettel=await Zettel.findOne({_id:req.params.id,userId});
  if(!existingZettel)return res.status(404).json({success:false,message:"Zettel not found"});

  const zettel=await populateZettel(
   Zettel.findOneAndUpdate(
    {_id:req.params.id,userId},
    {isFavorite:!existingZettel.isFavorite},
    {returnDocument:"after",runValidators:true}
   )
  );

  res.json({success:true,data:zettel});
 }catch(error){
  res.status(400).json({success:false,message:error.message});
 }
};

export const deleteZettel=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid zettel ID"});

  const zettel=await Zettel.findOneAndDelete({_id:req.params.id,userId});
  if(!zettel)return res.status(404).json({success:false,message:"Zettel not found"});

  res.json({success:true,message:"Zettel deleted"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const saveQuestionAnswer=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid zettel ID"});
  const zettel=await Zettel.findOne({_id:req.params.id,userId});
  if(!zettel)return res.status(404).json({success:false,message:"Zettel not found"});

  const requested=String(req.body?.question||"").trim();
  const question=zettel.questions.find(item=>String(item).trim()===requested);
  if(!question)return res.status(404).json({success:false,message:"Question not found on this zettel"});
  if(typeof req.body?.answer!=="string")return res.status(400).json({success:false,message:"Answer must be text"});

  const answer=req.body.answer;
  if(!answer.replace(/<[^>]*>/g," ").replace(/&nbsp;|&#160;/gi," ").trim())return res.status(400).json({success:false,message:"Enter an answer before saving"});
  const existing=zettel.questionAnswers.find(item=>item.question===question);
  if(existing)existing.answer=answer;
  else zettel.questionAnswers.push({question,answer});
  await zettel.save();
  res.json({success:true,data:{question,answer}});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};

export const deleteQuestionAnswer=async(req,res)=>{
 try{
  const userId=getUserId(req);
  if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({success:false,message:"Invalid zettel ID"});
  const zettel=await Zettel.findOne({_id:req.params.id,userId});
  if(!zettel)return res.status(404).json({success:false,message:"Zettel not found"});
  const question=String(req.body?.question||"").trim();
  const index=zettel.questionAnswers.findIndex(item=>item.question===question);
  if(index<0)return res.status(404).json({success:false,message:"Saved answer not found"});
  zettel.questionAnswers.splice(index,1);
  await zettel.save();
  res.json({success:true,message:"Answer deleted"});
 }catch(error){
  res.status(500).json({success:false,message:error.message});
 }
};
