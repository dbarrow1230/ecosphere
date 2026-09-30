// backend/controllers/BorrowedBookController.js
import mongoose from "mongoose";
import BorrowedBookModel from "../models/BorrowedBookModel.js";
import AuthorModel from "../models/AuthorModel.js";
import BookModel from "../models/BookModel.js";
import BorrowSourceModel from "../models/BorrowSourceModel.js";
import FormatModel from "../models/FormatModel.js";
import FileTypeModel from "../models/FileTypeModel.js";

const borrowedBookPopulate=[
 {path:"authors"},
 {path:"book"},
 {path:"borrowSource"},
 {path:"format"},
 {path:"fileTypes"}
];

const applyPopulate=query=>{
 borrowedBookPopulate.forEach(item=>query.populate(item));
 return query;
};

const toObjectId=value=>mongoose.Types.ObjectId.isValid(value)?new mongoose.Types.ObjectId(value):null;

const normalizeObjectIdArray=value=>
 !Array.isArray(value)
  ?[]
  :value.map(item=>toObjectId(item)).filter(Boolean);

const findIdsByName=async(Model,searchField,value)=>{
 if(!value)return [];
 const regex=new RegExp(value,"i");
 const docs=await Model.find({[searchField]:{$regex:regex}}).select("_id").lean();
 return docs.map(item=>item._id);
};

const findAuthorIdsByName=async value=>{
 if(!value)return [];
 const regex=new RegExp(value,"i");
 const docs=await AuthorModel.find({
  $or:[
   {displayName:{$regex:regex}},
   {firstName:{$regex:regex}},
   {middleName:{$regex:regex}},
   {lastName:{$regex:regex}},
   {sortName:{$regex:regex}}
  ]
 }).select("_id").lean();
 return docs.map(item=>item._id);
};

const normalizeDate=value=>{
 if(value===null||value===undefined||value==="")return null;
 const date=new Date(value);
 return Number.isNaN(date.getTime())?null:date;
};

const normalizeReadingNumber=value=>
 value===null||value===undefined||value===""?0:Math.max(0,Number(value)||0);

const normalizeStringArray=value=>{
 if(!Array.isArray(value))return [];
 return value.map(item=>String(item).trim()).filter(Boolean);
};

const normalizeBoolean=value=>{
 if(value===true||value==="true"||value===1||value==="1")return true;
 return false;
};

const normalizeEnumValue=(value,allowedValues,defaultValue)=>{
 const input=(value||defaultValue).toString().trim();
 return allowedValues.find(item=>item.toLowerCase()===input.toLowerCase())||defaultValue;
};

const normalizeBorrowedBookPayload=body=>{
 const payload={...body};

 if(Object.prototype.hasOwnProperty.call(payload,"authors")){
  payload.authors=normalizeObjectIdArray(payload.authors);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"book")){
  payload.book=payload.book?toObjectId(payload.book):null;
 }

 if(Object.prototype.hasOwnProperty.call(payload,"borrowSource")){
  payload.borrowSource=payload.borrowSource?toObjectId(payload.borrowSource):null;
 }

 if(Object.prototype.hasOwnProperty.call(payload,"format")){
  payload.format=payload.format?toObjectId(payload.format):null;
 }

 if(Object.prototype.hasOwnProperty.call(payload,"fileTypes")){
  payload.fileTypes=normalizeObjectIdArray(payload.fileTypes);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"title")){
  payload.title=(payload.title||"").toString().trim();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"subtitle")){
  payload.subtitle=(payload.subtitle||"").toString().trim();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"borrowedFrom")){
  payload.borrowedFrom=(payload.borrowedFrom||"").toString().trim();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"borrowedDate")){
  payload.borrowedDate=normalizeDate(payload.borrowedDate);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"dueDate")){
  payload.dueDate=normalizeDate(payload.dueDate);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"returnedDate")){
  payload.returnedDate=normalizeDate(payload.returnedDate);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"status")){
  payload.status=normalizeEnumValue(payload.status,["Borrowed","Returned","Overdue","Auto Returned","Renewed","Lost"],"Borrowed");
 }

 if(Object.prototype.hasOwnProperty.call(payload,"isDigital")){
  payload.isDigital=normalizeBoolean(payload.isDigital);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"autoReturns")){
  payload.autoReturns=normalizeBoolean(payload.autoReturns);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"renewalCount")){
  payload.renewalCount=Math.max(0,Number(payload.renewalCount||0));
 }

 if(Object.prototype.hasOwnProperty.call(payload,"notes")){
  payload.notes=normalizeStringArray(payload.notes);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"reading")){
  payload.reading={...(payload.reading||{})};

  if(Object.prototype.hasOwnProperty.call(payload.reading,"status")){
   payload.reading.status=normalizeEnumValue(payload.reading.status,["Unread","Reading","Paused","Finished","Abandoned"],"Unread");
  }

  if(Object.prototype.hasOwnProperty.call(payload.reading,"currentPage")){
   payload.reading.currentPage=normalizeReadingNumber(payload.reading.currentPage);
  }

  if(Object.prototype.hasOwnProperty.call(payload.reading,"totalPages")){
   payload.reading.totalPages=normalizeReadingNumber(payload.reading.totalPages);
  }

  if(Object.prototype.hasOwnProperty.call(payload.reading,"startedAt")){
   payload.reading.startedAt=normalizeDate(payload.reading.startedAt);
  }

  if(Object.prototype.hasOwnProperty.call(payload.reading,"finishedAt")){
   payload.reading.finishedAt=normalizeDate(payload.reading.finishedAt);
  }

  if(Object.prototype.hasOwnProperty.call(payload.reading,"lastReadAt")){
   payload.reading.lastReadAt=normalizeDate(payload.reading.lastReadAt);
  }

  if(Object.prototype.hasOwnProperty.call(payload.reading,"progressPercent")){
   delete payload.reading.progressPercent;
  }
 }

 return payload;
};

const buildBorrowedBookQuery=async queryParams=>{
 const {search="",status="",reading="",book="",author="",borrowSource="",borrowedFrom="",format="",fileType="",isDigital="",autoReturns="",overdue="",dueSoon="",missing="",has="",sort=""}=queryParams;
 const query={};

 if(book){
  const bookValue=book.toString().trim();
  query[mongoose.Types.ObjectId.isValid(bookValue)?"_id":"slug"]=bookValue;
 }

 if(status)query.status=normalizeEnumValue(status,["Borrowed","Returned","Overdue","Auto Returned","Renewed","Lost"],"Borrowed");

 const readingStatus=normalizeEnumValue(reading,["Unread","Reading","Paused","Finished","Abandoned"],"");
 if(readingStatus)query["reading.status"]=readingStatus;

 if(isDigital!=="")query.isDigital=normalizeBoolean(isDigital);
 if(autoReturns!=="")query.autoReturns=normalizeBoolean(autoReturns);

 if(overdue==="true"){
  query.status={$nin:["Returned","Auto Returned"]};
  query.dueDate={$lt:new Date()};
 }

 if(dueSoon==="true"){
  const today=new Date();
  const soon=new Date();
  soon.setDate(today.getDate()+7);
  query.status={$nin:["Returned","Auto Returned"]};
  query.dueDate={$gte:today,$lte:soon};
 }

 if(missing){
  const missingKey=missing.toString().trim().toLowerCase();

  if(missingKey==="authors"){
   query.$or=[...(query.$or||[]),{authors:{$exists:false}},{authors:{$size:0}},{authors:null}];
  }

  if(missingKey==="borrowsource"){
   query.$or=[...(query.$or||[]),{borrowSource:{$exists:false}},{borrowSource:null}];
  }

  if(missingKey==="borrowedfrom"){
   query.$or=[...(query.$or||[]),{borrowedFrom:{$exists:false}},{borrowedFrom:null},{borrowedFrom:""}];
  }

  if(missingKey==="format"){
   query.$or=[...(query.$or||[]),{format:{$exists:false}},{format:null}];
  }

  if(missingKey==="duedate"){
   query.$or=[...(query.$or||[]),{dueDate:{$exists:false}},{dueDate:null}];
  }
 }

 if(has){
  const hasKey=has.toString().trim().toLowerCase();

  if(hasKey==="book"){
   query.book={$exists:true,$ne:null};
  }

  if(hasKey==="borrowsource"){
   query.borrowSource={$exists:true,$ne:null};
  }

  if(hasKey==="format"){
   query.format={$exists:true,$ne:null};
  }
 }

 if(author){
  const authorIds=mongoose.Types.ObjectId.isValid(author)?[author]:await findAuthorIdsByName(author);
  query.authors={$in:authorIds.length?authorIds:[null]};
 }

 if(borrowSource){
  const borrowSourceIds=mongoose.Types.ObjectId.isValid(borrowSource)?[borrowSource]:await findIdsByName(BorrowSourceModel,"name",borrowSource);
  query.borrowSource={$in:borrowSourceIds.length?borrowSourceIds:[null]};
 }

 if(borrowedFrom){
  query.borrowedFrom={$regex:borrowedFrom.toString().trim(),$options:"i"};
 }

 if(format){
  const formatIds=mongoose.Types.ObjectId.isValid(format)?[format]:await findIdsByName(FormatModel,"name",format);
  query.format={$in:formatIds.length?formatIds:[null]};
 }

 if(fileType){
  const fileTypeIds=mongoose.Types.ObjectId.isValid(fileType)?[fileType]:await findIdsByName(FileTypeModel,"name",fileType);
  query.fileTypes={$in:fileTypeIds.length?fileTypeIds:[null]};
 }

 if(search){
  const authorIds=await findAuthorIdsByName(search);
  const bookIds=await findIdsByName(BookModel,"title",search);
  const borrowSourceIds=await findIdsByName(BorrowSourceModel,"name",search);
  const formatIds=await findIdsByName(FormatModel,"name",search);
  const fileTypeIds=await findIdsByName(FileTypeModel,"name",search);

  query.$or=[
   ...(query.$or||[]),
   {title:{$regex:search,$options:"i"}},
   {subtitle:{$regex:search,$options:"i"}},
   {slug:{$regex:search,$options:"i"}},
   {borrowedFrom:{$regex:search,$options:"i"}},
   {status:{$regex:search,$options:"i"}},
   {notes:{$regex:search,$options:"i"}},
   {"reading.status":{$regex:search,$options:"i"}},
   ...(Number.isFinite(Number(search))?[{renewalCount:Number(search)},{"reading.currentPage":Number(search)},{"reading.totalPages":Number(search)},{"reading.progressPercent":Number(search)}]:[]),
   ...(authorIds.length?[{authors:{$in:authorIds}}]:[]),
   ...(bookIds.length?[{book:{$in:bookIds}}]:[]),
   ...(borrowSourceIds.length?[{borrowSource:{$in:borrowSourceIds}}]:[]),
   ...(formatIds.length?[{format:{$in:formatIds}}]:[]),
   ...(fileTypeIds.length?[{fileTypes:{$in:fileTypeIds}}]:[])
  ];
 }

 return query;
};

export const createBorrowedBook=async(req,res)=>{
 try{
  const payload=normalizeBorrowedBookPayload(req.body);
  const borrowedBook=await BorrowedBookModel.create(payload);
  const populated=await applyPopulate(BorrowedBookModel.findById(borrowedBook._id));

  return res.status(201).json({
   success:true,
   message:"Borrowed book created successfully",
   borrowedBook:await populated
  });
 }catch(error){
  console.error("CREATE BORROWED BOOK ERROR:",error);

  if(error.code===11000){
   return res.status(409).json({success:false,message:"Borrowed book slug already exists",error:error.message});
  }

  if(error.name==="ValidationError"){
   const firstError=Object.values(error.errors||{})[0];
   return res.status(400).json({success:false,message:firstError?.message||"Validation failed",error:error.message});
  }

  if(error.name==="CastError"){
   return res.status(400).json({success:false,message:`Invalid value for ${error.path}`,error:error.message});
  }

  return res.status(500).json({success:false,message:error.message||"Failed to create borrowed book",error:error.message});
 }
};

export const getBorrowedBooks=async(req,res)=>{
 try{
  const {page=1,limit,sort="dueDate",order="asc"}=req.query;
  const query=await buildBorrowedBookQuery(req.query);

  const currentPage=Math.max(parseInt(page)||1,1);
  const perPage=limit?Math.max(parseInt(limit)||1,1):0;
  const skip=perPage?(currentPage-1)*perPage:0;
  const sortOrder=order==="desc"?-1:1;

  const findQuery=BorrowedBookModel.find(query).sort({[sort]:sortOrder});

  if(perPage){
   findQuery.skip(skip).limit(perPage);
  }

  const [borrowedBooks,total]=await Promise.all([
   applyPopulate(findQuery),
   BorrowedBookModel.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   total,
   page:currentPage,
   pages:perPage?Math.ceil(total/perPage):1,
   limit:perPage||total,
   borrowedBooks
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch borrowed books",
   error:error.message
  });
 }
};

export const getBorrowedBookFilterOptions=async(req,res)=>{
 try{
  const [authors,borrowSources,formats,fileTypes,borrowedFrom,statuses,readingStatuses]=await Promise.all([
   AuthorModel.find({}).sort({displayName:1,lastName:1,firstName:1}).select("displayName firstName middleName lastName name").lean(),
   BorrowSourceModel.find({}).sort({name:1}).select("name website notes").lean(),
   FormatModel.find({}).sort({name:1}).select("name").lean(),
   FileTypeModel.find({}).sort({name:1}).select("name").lean(),
   BorrowedBookModel.distinct("borrowedFrom"),
   BorrowedBookModel.distinct("status"),
   BorrowedBookModel.distinct("reading.status")
  ]);

  return res.status(200).json({
   success:true,
   authors,
   borrowSources,
   formats,
   fileTypes,
   borrowedFrom:borrowedFrom.filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b))),
   statuses:statuses.filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b))),
   readingStatuses:readingStatuses.filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b)))
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch borrowed book filter options",
   error:error.message
  });
 }
};

export const getBorrowedBookById=async(req,res)=>{
 try{
  const {id}=req.params;

  const borrowedBook=mongoose.Types.ObjectId.isValid(id)
   ?await applyPopulate(BorrowedBookModel.findById(id))
   :await applyPopulate(BorrowedBookModel.findOne({slug:id}));

  if(!borrowedBook)return res.status(404).json({success:false,message:"Borrowed book not found"});

  return res.status(200).json({success:true,borrowedBook});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch borrowed book",error:error.message});
 }
};

export const updateBorrowedBook=async(req,res)=>{
 try{
  const {id}=req.params;
  const payload=normalizeBorrowedBookPayload(req.body);

  const borrowedBook=mongoose.Types.ObjectId.isValid(id)
   ?await BorrowedBookModel.findById(id)
   :await BorrowedBookModel.findOne({slug:id});

  if(!borrowedBook)return res.status(404).json({success:false,message:"Borrowed book not found"});

  Object.assign(borrowedBook,payload);
  await borrowedBook.save();

  const populated=await applyPopulate(BorrowedBookModel.findById(borrowedBook._id));

  return res.status(200).json({
   success:true,
   message:"Borrowed book updated successfully",
   borrowedBook:await populated
  });
 }catch(error){
  console.error("UPDATE BORROWED BOOK ERROR:",error);

  if(error.code===11000){
   return res.status(409).json({success:false,message:"Borrowed book slug already exists",error:error.message});
  }

  if(error.name==="ValidationError"){
   const firstError=Object.values(error.errors||{})[0];
   return res.status(400).json({success:false,message:firstError?.message||"Validation failed",error:error.message});
  }

  if(error.name==="CastError"){
   return res.status(400).json({success:false,message:`Invalid value for ${error.path}`,error:error.message});
  }

  return res.status(500).json({success:false,message:error.message||"Failed to update borrowed book",error:error.message});
 }
};

export const deleteBorrowedBook=async(req,res)=>{
 try{
  const {id}=req.params;

  const borrowedBook=mongoose.Types.ObjectId.isValid(id)
   ?await BorrowedBookModel.findByIdAndDelete(id)
   :await BorrowedBookModel.findOneAndDelete({slug:id});

  if(!borrowedBook)return res.status(404).json({success:false,message:"Borrowed book not found"});

  return res.status(200).json({success:true,message:"Borrowed book deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete borrowed book",error:error.message});
 }
};