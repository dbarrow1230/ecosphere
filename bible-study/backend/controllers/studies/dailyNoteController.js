// backend/controllers/studies/dailyNoteController.js
import DailyNote from "../../models/studies/dailyNoteModel.js";

let obsoleteUniqueIndexDropPromise=null;

const removeObsoleteUniqueDateIndex=()=>{
 if(!obsoleteUniqueIndexDropPromise){
  obsoleteUniqueIndexDropPromise=DailyNote.collection.dropIndex("user_1_journalDate_1").catch(err=>{
   if(err?.codeName==="IndexNotFound"||err?.code===27)return null;
   obsoleteUniqueIndexDropPromise=null;
   throw err;
  });
 }

 return obsoleteUniqueIndexDropPromise;
};

const normalizeDate=value=>{
 if(!value)return null;
 const match=String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
 if(match){
  return new Date(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3])));
 }

 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return null;
 date.setHours(0,0,0,0);
 return date;
};

const normalizeNumber=value=>{
 if(value===""||value===null||value===undefined)return null;
 const number=Number(value);
 return Number.isFinite(number)?number:null;
};

const normalizeEntryNotes=entry=>{
 const notes=Array.isArray(entry?.notes)?entry.notes:[];
 const normalized=notes.map(note=>{
  const notedAt=normalizeDate(note?.notedAt||note?.createdAt);

  return{
   text:String(note?.text||note?.note||"").trim(),
   ...(notedAt?{notedAt}:{})
  };
 }).filter(note=>note.text);

 const legacyNote=String(entry?.note||"").trim();
 if(legacyNote&&!normalized.some(note=>note.text===legacyNote)){
  normalized.push({
   text:legacyNote
  });
 }

 return normalized;
};

const tagStopWords=new Set([
 "the","and","for","that","with","from","this","into","your","their","there","then","than","have","will",
 "shall","lord","god","was","were","are","but","not","you","his","her","him","she","they","them","our",
 "out","who","what","when","where","why","how","daily","note","text","passage","scripture"
]);

const generateTags=entry=>{
 const notes=normalizeEntryNotes(entry);
 const source=[
  entry?.book,
  entry?.passageText,
  entry?.note,
  ...notes.map(note=>note.text)
 ].filter(Boolean).join(" ");

 const generated=String(source)
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g," ")
  .split(/\s+/)
  .map(tag=>tag.trim())
  .filter(tag=>tag.length>2&&!tagStopWords.has(tag));

 return [...new Set(generated)].slice(0,12);
};

const normalizeEntry=entry=>({
 reference:String(entry?.reference||"").trim(),
 translation:String(entry?.translation||"").trim(),
 book:String(entry?.book||"").trim(),
 chapterStart:normalizeNumber(entry?.chapterStart),
 chapterEnd:normalizeNumber(entry?.chapterEnd),
 verseStart:normalizeNumber(entry?.verseStart),
 verseEnd:normalizeNumber(entry?.verseEnd),
 passageText:String(entry?.passageText||"").trim(),
 note:String(entry?.note||"").trim(),
 notes:normalizeEntryNotes(entry),
 tags:generateTags(entry),
 memorize:Boolean(entry?.memorize),
 memorizationStatus:["memorize","in process","reviewed"].includes(entry?.memorizationStatus)?entry.memorizationStatus:"memorize"
});

const normalizePayload=body=>{
 const entries=Array.isArray(body.entries)?body.entries:[];
 const journalDate=normalizeDate(body.journalDate);

 return{
  user:body.user,
  journalDate,
  title:String(body.title||"").trim(),
  summary:String(body.summary||"").trim(),
  entries:entries.map(normalizeEntry).filter(entry=>entry.reference||entry.passageText||entry.notes.length)
 };
};

const getSaveErrorMessage=err=>{
 if(err?.code===11000)return "A duplicate daily note index is still active. Restart the backend so the obsolete user/date unique index can be removed.";
 if(err?.name==="ValidationError"){
  return Object.values(err.errors||{}).map(error=>error.message).filter(Boolean).join(" ")||err.message;
 }
 return err?.message||"Unable to save daily note.";
};

export const getDailyNotes=async(req,res)=>{
 try{
  const {user,date}=req.query;
  const filter={};

  if(user)filter.user=user;
  if(date){
   const start=normalizeDate(date);
   const end=new Date(start);
   end.setDate(end.getDate()+1);
   filter.journalDate={$gte:start,$lt:end};
  }

  const items=await DailyNote.find(filter)
   .populate("user")
   .sort({journalDate:-1,updatedAt:-1});

  return res.status(200).json({
   success:true,
   count:items.length,
   data:items
  });
 }catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch daily notes",
   error:err.message
  });
 }
};

export const getDailyNoteById=async(req,res)=>{
 try{
  const item=await DailyNote.findById(req.params.id).populate("user");

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Daily note not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:item
  });
 }catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch daily note",
   error:err.message
  });
 }
};

export const createDailyNote=async(req,res)=>{
 try{
  await removeObsoleteUniqueDateIndex();
  const payload=normalizePayload(req.body);
  const item=await DailyNote.create(payload);
  const populatedItem=await DailyNote.findById(item._id).populate("user");

  return res.status(201).json({
   success:true,
   message:"Daily note created successfully",
   data:populatedItem
  });
 }catch(err){
  return res.status(500).json({
   success:false,
   message:getSaveErrorMessage(err),
   error:err.message
  });
 }
};

export const updateDailyNote=async(req,res)=>{
 try{
  await removeObsoleteUniqueDateIndex();
  const payload=normalizePayload(req.body);
  const existingItem=await DailyNote.findById(req.params.id);

  if(!existingItem){
   return res.status(404).json({
    success:false,
    message:"Daily note not found"
   });
  }

  const item=await DailyNote.findByIdAndUpdate(req.params.id,payload,{
   returnDocument:"after",
   runValidators:true
  }).populate("user");

  return res.status(200).json({
   success:true,
   message:"Daily note updated successfully",
   data:item
  });
 }catch(err){
  return res.status(500).json({
   success:false,
   message:getSaveErrorMessage(err),
   error:err.message
  });
 }
};

export const deleteDailyNote=async(req,res)=>{
 try{
  const item=await DailyNote.findByIdAndDelete(req.params.id);

  if(!item){
   return res.status(404).json({
    success:false,
    message:"Daily note not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Daily note deleted successfully"
  });
 }catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete daily note",
   error:err.message
  });
 }
};
