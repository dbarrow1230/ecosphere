// backend/controllers/BookController.js
import mongoose from "mongoose";
import BookModel from "../models/BookModel.js";
import AuthorModel from "../models/AuthorModel.js";
import PublisherModel from "../models/PublisherModel.js";
import SeriesModel from "../models/SeriesModel.js";
import GenreModel from "../models/GenreModel.js";
import LanguageModel from "../models/LanguageModel.js";
import FormatModel from "../models/FormatModel.js";
import FileTypeModel from "../models/FileTypeModel.js";
import AcquisitionSourceModel from "../models/AcquisitionSourceModel.js";
import AcquisitionMethodModel from "../models/AcquisitionMethodModel.js";
import Country from "../models/locations/countryModel.js";
import State from "../models/locations/stateModel.js";

const bookPopulate=[
 {path:"authors"},
 {path:"series"},
 {path:"publishers",populate:[
  {path:"country",model:Country},
  {path:"state",model:State}
 ]},
 {path:"publication.language"},
 {path:"acquisitionSource"},
 {path:"acquisitionMethod"},
 {path:"formats"},
 {path:"formatPrices.format"},
 {path:"fileTypes"},
 {path:"genres"}
];

const applyPopulate=query=>{
 bookPopulate.forEach(item=>query.populate(item));
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

const uniqueValues=values=>[...new Set(values.filter(Boolean).map(value=>String(value)))];

const addAndCondition=(query,condition)=>{
 query.$and=[...(query.$and||[]),condition];
};

const isEmptyStringField=field=>({
 $or:[
  {[field]:{$exists:false}},
  {[field]:null},
  {[field]:""}
 ]
});

const isPresentStringField=field=>({[field]:{$exists:true,$ne:""}});

const missingIsbnCondition=()=>({
 $and:[
  isEmptyStringField("isbn10"),
  isEmptyStringField("isbn13")
 ]
});

const hasIsbnCondition=()=>({
 $or:[
  isPresentStringField("isbn10"),
  isPresentStringField("isbn13")
 ]
});

const amazonRequiredCondition=()=>({
 $or:[
  {amazonListingRequired:{$in:[true,"true","yes","required","1"]}},
  {amazonRequired:{$in:[true,"true","yes","required","1"]}},
  {asinRequired:{$in:[true,"true","yes","required","1"]}},
  {requiresAsin:{$in:[true,"true","yes","required","1"]}},
  {requiresASIN:{$in:[true,"true","yes","required","1"]}},
  {requiresAmazon:{$in:[true,"true","yes","required","1"]}},
  {"amazon.required":{$in:[true,"true","yes","required","1"]}},
  {"metadata.amazonListingRequired":{$in:[true,"true","yes","required","1"]}},
  {catalogStatus:{$in:["Amazon Required","amazon required","ASIN Required","asin required"]}}
 ]
});

const getDigitalFormatIds=async()=>{
 const docs=await FormatModel.find({
  name:{$regex:/digital|ebook|e-book|kindle|pdf|epub|mobi/i}
 }).select("_id").lean();
 return docs.map(item=>item._id);
};

const digitalFormatCondition=ids=>({
 $or:ids.length?[
  {formats:{$in:ids}},
  {"formatPrices.format":{$in:ids}}
 ]:[{_id:null}]
});

const normalizePrice=value=>{
 if(value===null||value===undefined||value==="")return null;
 const num=Number(value);
 return Number.isFinite(num)&&num>=0?num:0;
};

const normalizeCurrency=value=>(value||"USD").toString().trim().toUpperCase();

const normalizeStringArray=value=>{
 if(!Array.isArray(value))return [];
 return value.map(item=>String(item).trim()).filter(Boolean);
};

const normalizeNullableNumber=value=>{
 if(value===null||value===undefined||value==="")return null;
 const num=Number(value);
 return Number.isFinite(num)?num:null;
};

const normalizeReadingNumber=value=>
 value===null||value===undefined||value===""?0:Math.max(0,Number(value)||0);

const normalizeDate=value=>{
 if(value===null||value===undefined||value==="")return null;
 const date=new Date(value);
 return Number.isNaN(date.getTime())?null:date;
};

const normalizeDurationValue=value=>
 value===null||value===undefined||value===""?0:Math.max(0,Number(value)||0);

const normalizeFormatPrices=formatPrices=>
 !Array.isArray(formatPrices)
  ?[]
  :formatPrices.map(item=>({
   ...item,
   format:toObjectId(item?.format),
   price:normalizePrice(item?.price),
   currency:normalizeCurrency(item?.currency)
  })).filter(item=>item.format);

const normalizeEnumValue=(value,allowedValues,defaultValue)=>{
 const input=(value||defaultValue).toString().trim();
 return allowedValues.find(item=>item.toLowerCase()===input.toLowerCase())||defaultValue;
};

const normalizeBookPayload=body=>{
 const payload={...body};

 delete payload.catalogStatus;

 if(Object.prototype.hasOwnProperty.call(payload,"authors")){
  payload.authors=normalizeObjectIdArray(payload.authors);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"publishers")){
  payload.publishers=normalizeObjectIdArray(payload.publishers);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"formats")){
  payload.formats=normalizeObjectIdArray(payload.formats);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"fileTypes")){
  payload.fileTypes=normalizeObjectIdArray(payload.fileTypes);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"genres")){
  payload.genres=normalizeObjectIdArray(payload.genres);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"series")){
  payload.series=payload.series?toObjectId(payload.series):null;
 }

 if(Object.prototype.hasOwnProperty.call(payload,"acquisitionSource")){
  payload.acquisitionSource=payload.acquisitionSource?toObjectId(payload.acquisitionSource):null;
 }

 if(Object.prototype.hasOwnProperty.call(payload,"acquisitionMethod")){
  payload.acquisitionMethod=payload.acquisitionMethod?toObjectId(payload.acquisitionMethod):null;
 }

 if(Object.prototype.hasOwnProperty.call(payload,"acquisitionNotes")){
  payload.acquisitionNotes=(payload.acquisitionNotes||"").toString().trim();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"publication")){
  payload.publication={...(payload.publication||{})};
  if(Object.prototype.hasOwnProperty.call(payload.publication,"language")){
   payload.publication.language=payload.publication.language?toObjectId(payload.publication.language):null;
  }
  if(Object.prototype.hasOwnProperty.call(payload.publication,"publishedDate")){
   payload.publication.publishedDate=normalizeDate(payload.publication.publishedDate);
  }
 }

 if(Object.prototype.hasOwnProperty.call(payload,"seriesNumber")){
  payload.seriesNumber=normalizeNullableNumber(payload.seriesNumber);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"cost")){
  payload.cost=normalizePrice(payload.cost);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"currency")){
  payload.currency=normalizeCurrency(payload.currency);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"formatPrices")){
  payload.formatPrices=normalizeFormatPrices(payload.formatPrices);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"duration")){
  payload.duration={
   hours:normalizeDurationValue(payload.duration?.hours),
   minutes:Math.min(59,normalizeDurationValue(payload.duration?.minutes))
  };
 }

 if(Object.prototype.hasOwnProperty.call(payload,"tags")){
  payload.tags=normalizeStringArray(payload.tags);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"subjects")){
  payload.subjects=normalizeStringArray(payload.subjects);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"images")){
  payload.images=normalizeStringArray(payload.images);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"notes")){
  payload.notes=normalizeStringArray(payload.notes);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"purchaseDate")){
  payload.purchaseDate=normalizeDate(payload.purchaseDate);
 }

 if(Object.prototype.hasOwnProperty.call(payload,"condition")){
  payload.condition=normalizeEnumValue(payload.condition,["New","Like New","Very Good","Good","Fair","Poor","Damaged"],"New");
 }

 if(Object.prototype.hasOwnProperty.call(payload,"isbn10")){
  payload.isbn10=(payload.isbn10||"").toString().trim().toUpperCase().replace(/[^0-9X]/g,"");
 }

 if(Object.prototype.hasOwnProperty.call(payload,"isbn13")){
  payload.isbn13=(payload.isbn13||"").toString().trim().replace(/[^0-9]/g,"");
 }

 if(Object.prototype.hasOwnProperty.call(payload,"eisbn")){
  payload.eisbn=(payload.eisbn||"").toString().trim().replace(/[^0-9]/g,"");
 }

 if(Object.prototype.hasOwnProperty.call(payload,"asin")){
  payload.asin=(payload.asin||"").toString().trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
 }

 if(Object.prototype.hasOwnProperty.call(payload,"customId")){
  payload.customId=(payload.customId||"").toString().trim();
 }

 if(Object.prototype.hasOwnProperty.call(payload,"identifierNotes")){
  payload.identifierNotes=(payload.identifierNotes||"").toString().trim();
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

 if(Object.prototype.hasOwnProperty.call(payload,"rating")){
  payload.rating={...(payload.rating||{})};

  if(Object.prototype.hasOwnProperty.call(payload.rating,"average")){
   payload.rating.average=payload.rating.average===null||payload.rating.average===undefined||payload.rating.average===""?null:Number(payload.rating.average);
  }

  if(Object.prototype.hasOwnProperty.call(payload.rating,"personal")){
   payload.rating.personal=payload.rating.personal===null||payload.rating.personal===undefined||payload.rating.personal===""?null:Number(payload.rating.personal);
  }
 }

 return payload;
};

const buildBookQuery=async queryParams=>{
 const {search="",status="",reading="",book="",author="",publisher="",genre="",subject="",language="",format="",fileType="",series="",acquisitionSource="",acquisitionMethod="",minCost="",maxCost="",currency="",condition="",missing="",has="",duplicate="",required="",catalogStatus="",letter=""}=queryParams;
 const query={};
 const digitalFormatIds=missing||catalogStatus?await getDigitalFormatIds():[];
 const letterKey=String(letter||"").trim().toUpperCase();

 if(book){
  const bookValue=book.toString().trim();
  query[mongoose.Types.ObjectId.isValid(bookValue)?"_id":"slug"]=bookValue;
 }

 if(letterKey&&letterKey!=="ALL"){
  if(letterKey==="#"){
   addAndCondition(query,{title:{$regex:"^[^A-Za-z]",$options:"i"}});
  }else if(/^[A-Z]$/.test(letterKey)){
   addAndCondition(query,{title:{$regex:`^${letterKey}`,$options:"i"}});
  }
 }

 const readingStatus=normalizeEnumValue(status||reading,["Unread","Reading","Paused","Finished","Abandoned"],"");
 if(readingStatus)query["reading.status"]=readingStatus;

 if(condition)query.condition=normalizeEnumValue(condition,["New","Like New","Very Good","Good","Fair","Poor","Damaged"],"New");

 if(missing){
  const missingKey=missing.toString().trim().toLowerCase();

  if(missingKey==="metadata"){
   addAndCondition(query,{
    $or:[
     {authors:{$exists:false}},
     {authors:{$size:0}},
     {authors:null},
     {publishers:{$exists:false}},
     {publishers:{$size:0}},
     {publishers:null},
     {formats:{$exists:false}},
     {formats:{$size:0}},
     {formats:null},
     {images:{$exists:false}},
     {images:{$size:0}},
     {images:null},
     {images:""},
     {subjects:{$exists:false}},
     {subjects:{$size:0}},
     {subjects:null},
     {subjects:""}
    ]
   });
  }

  if(missingKey==="authors"){
   addAndCondition(query,{
    $or:[
     {authors:{$exists:false}},
     {authors:{$size:0}},
     {authors:null}
    ]
   });
  }

  if(missingKey==="publishers"){
   query.$or=[...(query.$or||[]),{publishers:{$exists:false}},{publishers:{$size:0}},{publishers:null}];
  }

  if(missingKey==="formats"){
   query.$or=[...(query.$or||[]),{formats:{$exists:false}},{formats:{$size:0}},{formats:null}];
  }

  if(missingKey==="covers"){
   query.$or=[...(query.$or||[]),{images:{$exists:false}},{images:{$size:0}},{images:null},{images:""}];
  }

  if(missingKey==="isbn"||missingKey==="isbn10"||missingKey==="isbn13"){
   addAndCondition(query,missingIsbnCondition());
  }

  if(missingKey==="eisbn"){
   addAndCondition(query,digitalFormatCondition(digitalFormatIds));
   addAndCondition(query,isEmptyStringField("eisbn"));
  }

  if(missingKey==="asin"){
   if(String(required).trim().toLowerCase()==="true")addAndCondition(query,amazonRequiredCondition());
   addAndCondition(query,isEmptyStringField("asin"));
  }

  if(missingKey==="customid"){
   addAndCondition(query,{
    $or:[{customId:{$exists:false}},{customId:null},{customId:""}]
   });
  }

  if(missingKey==="identifiernotes"){
   addAndCondition(query,{
    $or:[{identifierNotes:{$exists:false}},{identifierNotes:null},{identifierNotes:""}]
   });
  }

  if(missingKey==="acquisitionsource"){
   addAndCondition(query,{
    $or:[{acquisitionSource:{$exists:false}},{acquisitionSource:null}]
   });
  }

  if(missingKey==="acquisitionmethod"){
   addAndCondition(query,{
    $or:[{acquisitionMethod:{$exists:false}},{acquisitionMethod:null}]
   });
  }

  if(missingKey==="acquisitionnotes"){
   addAndCondition(query,{
    $or:[{acquisitionNotes:{$exists:false}},{acquisitionNotes:null},{acquisitionNotes:""}]
   });
  }

  if(missingKey==="subjects"){
   query.$or=[...(query.$or||[]),{subjects:{$exists:false}},{subjects:{$size:0}},{subjects:null},{subjects:""}];
  }
 }

 if(has){
  const hasKey=has.toString().trim().toLowerCase();

  if(hasKey==="cover"){
   query.images={$exists:true,$type:"array",$ne:[]};
  }

  if(hasKey==="isbn"){
   addAndCondition(query,hasIsbnCondition());
  }

  if(hasKey==="asin"){
   query.asin={$exists:true,$ne:""};
  }

  if(hasKey==="customid"){
   query.customId={$exists:true,$ne:""};
  }

  if(hasKey==="identifier"){
   addAndCondition(query,{
    $or:[
     {isbn10:{$exists:true,$ne:""}},
     {isbn13:{$exists:true,$ne:""}},
     {eisbn:{$exists:true,$ne:""}},
     {asin:{$exists:true,$ne:""}},
     {customId:{$exists:true,$ne:""}}
    ]
   });
  }

  if(hasKey==="identifiernotes"){
   query.identifierNotes={$exists:true,$ne:""};
  }

  if(hasKey==="acquisitionsource"){
   query.acquisitionSource={$exists:true,$ne:null};
  }

  if(hasKey==="acquisitionmethod"){
   query.acquisitionMethod={$exists:true,$ne:null};
  }

  if(hasKey==="acquisitionnotes"){
   query.acquisitionNotes={$exists:true,$ne:""};
  }

  if(hasKey==="subjects"){
   query.subjects={$exists:true,$type:"array",$ne:[]};
  }
 }

 if(catalogStatus){
  const statusKey=catalogStatus.toString().trim().toLowerCase();

  if(statusKey==="asin only"){
   addAndCondition(query,{asin:{$exists:true,$ne:""}});
   addAndCondition(query,missingIsbnCondition());
  }

  if(statusKey==="no isbn"){
   addAndCondition(query,missingIsbnCondition());
  }

  if(statusKey==="digital no isbn"){
   addAndCondition(query,digitalFormatCondition(digitalFormatIds));
   addAndCondition(query,missingIsbnCondition());
  }

  if(statusKey==="manual entry"){
   addAndCondition(query,{
    $or:[
     {catalogStatus:{$regex:/^manual entry$/i}},
     {source:{$regex:/^manual$/i}},
     {entrySource:{$regex:/^manual$/i}},
     {importSource:{$regex:/^manual$/i}},
     {createdByImport:{$regex:/^manual$/i}}
    ]
   });
  }
 }

 if(duplicate){
  const duplicateKey=duplicate.toString().trim().toLowerCase();

  if(duplicateKey==="title"){
   const duplicateRows=await BookModel.aggregate([
    {$match:{title:{$type:"string",$ne:""}}},
    {$group:{_id:{
     title:{$toLower:{$ifNull:["$title",""]}},
     subtitle:{$toLower:{$ifNull:["$subtitle",""]}},
     edition:{$toLower:{$ifNull:["$edition",""]}},
     volume:{$toLower:{$ifNull:["$volume",""]}},
     series:{$ifNull:["$series",null]},
     seriesNumber:{$ifNull:["$seriesNumber",null]}
    },ids:{$push:"$_id"},count:{$sum:1}}},
    {$match:{count:{$gt:1}}},
    {$project:{ids:1}}
   ]);
   query._id={$in:duplicateRows.flatMap(row=>row.ids)};
  }

  if(duplicateKey==="isbn"){
   const duplicateRows=await BookModel.aggregate([
    {$project:{
     isbn:{
      $cond:[
       {$ne:["$isbn13",""]},
       "$isbn13",
       {$cond:[{$ne:["$isbn10",""]},"$isbn10","$eisbn"]}
      ]
     }
    }},
    {$match:{isbn:{$type:"string",$ne:""}}},
    {$group:{_id:"$isbn",ids:{$push:"$_id"},count:{$sum:1}}},
    {$match:{count:{$gt:1}}},
    {$project:{ids:1}}
   ]);
   query._id={$in:duplicateRows.flatMap(row=>row.ids)};
  }

  if(duplicateKey==="asin"){
   const duplicateRows=await BookModel.aggregate([
    {$match:{asin:{$type:"string",$ne:""}}},
    {$group:{_id:"$asin",ids:{$push:"$_id"},count:{$sum:1}}},
    {$match:{count:{$gt:1}}},
    {$project:{ids:1}}
   ]);
   query._id={$in:duplicateRows.flatMap(row=>row.ids)};
  }

  if(duplicateKey==="customid"){
   const duplicateRows=await BookModel.aggregate([
    {$match:{customId:{$type:"string",$ne:""}}},
    {$group:{_id:"$customId",ids:{$push:"$_id"},count:{$sum:1}}},
    {$match:{count:{$gt:1}}},
    {$project:{ids:1}}
   ]);
   query._id={$in:duplicateRows.flatMap(row=>row.ids)};
  }

  if(duplicateKey==="identifier"){
   const duplicateRows=await BookModel.aggregate([
    {$project:{
     identifier:{
      $cond:[
       {$ne:["$isbn13",""]},
       "$isbn13",
       {$cond:[
        {$ne:["$isbn10",""]},
        "$isbn10",
        {$cond:[
         {$ne:["$eisbn",""]},
         "$eisbn",
         {$cond:[
          {$ne:["$asin",""]},
          "$asin",
          "$customId"
         ]}
        ]}
       ]}
      ]
     }
    }},
    {$match:{identifier:{$type:"string",$ne:""}}},
    {$group:{_id:"$identifier",ids:{$push:"$_id"},count:{$sum:1}}},
    {$match:{count:{$gt:1}}},
    {$project:{ids:1}}
   ]);
   query._id={$in:duplicateRows.flatMap(row=>row.ids)};
  }
 }

 if(author){
  const authorIds=mongoose.Types.ObjectId.isValid(author)?[author]:await findAuthorIdsByName(author);
  query.authors={$in:authorIds.length?authorIds:[null]};
 }

 if(publisher){
  const publisherIds=mongoose.Types.ObjectId.isValid(publisher)?[publisher]:await findIdsByName(PublisherModel,"name",publisher);
  query.publishers={$in:publisherIds.length?publisherIds:[null]};
 }

 if(genre){
  const rawGenre=genre.toString().trim();
  const genreDocs=mongoose.Types.ObjectId.isValid(rawGenre)
   ?await GenreModel.find({_id:rawGenre}).select("name").lean()
   :await GenreModel.find({name:{$regex:new RegExp(rawGenre,"i")}}).select("_id name").lean();
  const genreObjectIds=[
   ...genreDocs.map(item=>item._id),
   ...(mongoose.Types.ObjectId.isValid(rawGenre)?[new mongoose.Types.ObjectId(rawGenre)]:[])
  ];
  const genreTextValues=uniqueValues([
   ...genreDocs.map(item=>item._id),
   ...genreDocs.map(item=>item.name),
   rawGenre
  ]).map(value=>value.trim().toLowerCase());
  const genreConditions=[];

  if(genreObjectIds.length){
   genreConditions.push({genres:{$in:genreObjectIds}});
  }

  if(genreTextValues.length){
   genreConditions.push({
    $expr:{
     $gt:[
      {
       $size:{
        $filter:{
         input:{$ifNull:["$genres",[]]},
         as:"genre",
         cond:{
          $in:[
           {
            $switch:{
             branches:[
              {case:{$eq:[{$type:"$$genre"},"objectId"]},then:{$toLower:{$toString:"$$genre"}}},
              {case:{$eq:[{$type:"$$genre"},"string"]},then:{$toLower:{$trim:{input:"$$genre"}}}},
              {case:{$eq:[{$type:"$$genre"},"object"]},then:{$toLower:{$trim:{input:{$ifNull:["$$genre.name",""]}}}}}
             ],
             default:""
            }
           },
           genreTextValues
          ]
         }
        }
       }
      },
      0
     ]
    }
   });
  }

  addAndCondition(query,{$or:genreConditions.length?genreConditions:[{_id:null}]});
 }

 if(subject){
  query.subjects={$regex:subject.toString().trim(),$options:"i"};
 }

 if(language){
  const languageIds=mongoose.Types.ObjectId.isValid(language)?[language]:await findIdsByName(LanguageModel,"name",language);
  query["publication.language"]={$in:languageIds.length?languageIds:[null]};
 }

 if(format){
  const formatIds=mongoose.Types.ObjectId.isValid(format)?[format]:await findIdsByName(FormatModel,"name",format);
  query.$or=[
   ...(query.$or||[]),
   {formats:{$in:formatIds.length?formatIds:[null]}},
   {"formatPrices.format":{$in:formatIds.length?formatIds:[null]}}
  ];
 }

 if(fileType){
  const fileTypeIds=mongoose.Types.ObjectId.isValid(fileType)?[fileType]:await findIdsByName(FileTypeModel,"name",fileType);
  query.fileTypes={$in:fileTypeIds.length?fileTypeIds:[null]};
 }

 if(series){
  const seriesIds=mongoose.Types.ObjectId.isValid(series)?[series]:await findIdsByName(SeriesModel,"name",series);
  query.series={$in:seriesIds.length?seriesIds:[null]};
 }

 if(acquisitionSource){
  const acquisitionSourceIds=mongoose.Types.ObjectId.isValid(acquisitionSource)?[acquisitionSource]:await findIdsByName(AcquisitionSourceModel,"name",acquisitionSource);
  query.acquisitionSource={$in:acquisitionSourceIds.length?acquisitionSourceIds:[null]};
 }

 if(acquisitionMethod){
  const acquisitionMethodIds=mongoose.Types.ObjectId.isValid(acquisitionMethod)?[acquisitionMethod]:await findIdsByName(AcquisitionMethodModel,"name",acquisitionMethod);
  query.acquisitionMethod={$in:acquisitionMethodIds.length?acquisitionMethodIds:[null]};
 }

 if(minCost!==""||maxCost!==""){
  const costCondition={};
  if(minCost!==""){
   const min=Number(minCost);
   if(Number.isFinite(min))costCondition.$gte=min;
  }
  if(maxCost!==""){
   const max=Number(maxCost);
   if(Number.isFinite(max))costCondition.$lte=max;
  }
  if(Object.keys(costCondition).length){
   addAndCondition(query,{
    $or:[
     {cost:costCondition},
     {"formatPrices.price":costCondition}
    ]
   });
  }
 }

 if(currency){
  query.$or=[
   ...(query.$or||[]),
   {currency:normalizeCurrency(currency)},
   {"formatPrices.currency":normalizeCurrency(currency)}
  ];
 }

 if(search){
  const authorIds=await findAuthorIdsByName(search);
  const publisherIds=await findIdsByName(PublisherModel,"name",search);
  const seriesIds=await findIdsByName(SeriesModel,"name",search);
  const genreIds=await findIdsByName(GenreModel,"name",search);
  const languageIds=await findIdsByName(LanguageModel,"name",search);
  const formatIds=await findIdsByName(FormatModel,"name",search);
  const fileTypeIds=await findIdsByName(FileTypeModel,"name",search);
  const acquisitionSourceIds=await findIdsByName(AcquisitionSourceModel,"name",search);
  const acquisitionMethodIds=await findIdsByName(AcquisitionMethodModel,"name",search);

  const searchOr=[
   {title:{$regex:search,$options:"i"}},
   {subtitle:{$regex:search,$options:"i"}},
   {slug:{$regex:search,$options:"i"}},
   {edition:{$regex:search,$options:"i"}},
   {volume:{$regex:search,$options:"i"}},
   {summary:{$regex:search,$options:"i"}},
   {isbn10:{$regex:search,$options:"i"}},
   {isbn13:{$regex:search,$options:"i"}},
   {eisbn:{$regex:search,$options:"i"}},
   {asin:{$regex:search,$options:"i"}},
   {customId:{$regex:search,$options:"i"}},
   {identifierNotes:{$regex:search,$options:"i"}},
   {acquisitionNotes:{$regex:search,$options:"i"}},
   {tags:{$regex:search,$options:"i"}},
   {subjects:{$regex:search,$options:"i"}},
   {notes:{$regex:search,$options:"i"}},
   {currency:{$regex:search,$options:"i"}},
   {"formatPrices.currency":{$regex:search,$options:"i"}},
   {condition:{$regex:search,$options:"i"}},
   {"reading.status":{$regex:search,$options:"i"}},
   ...(Number.isFinite(Number(search))?[{cost:Number(search)},{"formatPrices.price":Number(search)},{"duration.hours":Number(search)},{"duration.minutes":Number(search)},{"reading.currentPage":Number(search)},{"reading.totalPages":Number(search)},{"reading.progressPercent":Number(search)},{"seriesNumber":Number(search)}]:[]),
   ...(authorIds.length?[{authors:{$in:authorIds}}]:[]),
   ...(publisherIds.length?[{publishers:{$in:publisherIds}}]:[]),
   ...(seriesIds.length?[{series:{$in:seriesIds}}]:[]),
   ...(genreIds.length?[{genres:{$in:genreIds}}]:[]),
   ...(languageIds.length?[{"publication.language":{$in:languageIds}}]:[]),
   ...(formatIds.length?[{formats:{$in:formatIds}},{"formatPrices.format":{$in:formatIds}}]:[]),
   ...(fileTypeIds.length?[{fileTypes:{$in:fileTypeIds}}]:[]),
   ...(acquisitionSourceIds.length?[{acquisitionSource:{$in:acquisitionSourceIds}}]:[]),
   ...(acquisitionMethodIds.length?[{acquisitionMethod:{$in:acquisitionMethodIds}}]:[])
  ];

  if(query.$or?.length){
   query.$and=[
    {$or:query.$or},
    {$or:searchOr}
   ];
   delete query.$or;
  }else{
   query.$or=searchOr;
  }
 }

 return query;
};

export const createBook=async(req,res)=>{
 try{
  const payload=normalizeBookPayload(req.body);
  const book=await BookModel.create(payload);
  const populated=await applyPopulate(BookModel.findById(book._id));
  return res.status(201).json({success:true,message:"Book created successfully",book:await populated});
 }catch(error){
  console.error("CREATE BOOK ERROR:",error);

  if(error.code===11000){
   return res.status(409).json({success:false,message:"Book slug already exists",error:error.message});
  }

  if(error.name==="ValidationError"){
   const firstError=Object.values(error.errors||{})[0];
   return res.status(400).json({success:false,message:firstError?.message||"Validation failed",error:error.message});
  }

  if(error.name==="CastError"){
   return res.status(400).json({success:false,message:`Invalid value for ${error.path}`,error:error.message});
  }

  return res.status(500).json({success:false,message:error.message||"Failed to create book",error:error.message});
 }
};

export const getBooks=async(req,res)=>{
 try{
  const {page=1,limit,sort="title",order="asc"}=req.query;
  const query=await buildBookQuery(req.query);

  const currentPage=Math.max(parseInt(page)||1,1);
  const perPage=limit?Math.max(parseInt(limit)||1,1):0;
  const skip=perPage?(currentPage-1)*perPage:0;
  const sortOrder=order==="desc"?-1:1;

  const findQuery=BookModel.find(query).sort({[sort]:sortOrder});

  if(perPage){
   findQuery.skip(skip).limit(perPage);
  }

  const [books,total]=await Promise.all([
   applyPopulate(findQuery),
   BookModel.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   total,
   page:currentPage,
   pages:perPage?Math.ceil(total/perPage):1,
   limit:perPage||total,
   books
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch books",
   error:error.message
  });
 }
};

export const getBookFilterOptions=async(req,res)=>{
 try{
  const [authors,publishers,genres,formats,acquisitionSources,acquisitionMethods,subjects,conditions,readingStatuses]=await Promise.all([
   AuthorModel.find({}).sort({displayName:1,lastName:1,firstName:1}).select("displayName firstName middleName lastName name").lean(),
   PublisherModel.find({}).sort({name:1}).select("name").lean(),
   GenreModel.find({}).sort({name:1}).select("name").lean(),
   FormatModel.find({}).sort({name:1}).select("name").lean(),
   AcquisitionSourceModel.find({}).sort({name:1}).select("name website notes").lean(),
   AcquisitionMethodModel.find({}).sort({name:1}).select("name notes").lean(),
   BookModel.distinct("subjects"),
   BookModel.distinct("condition"),
   BookModel.distinct("reading.status")
  ]);

  return res.status(200).json({
   success:true,
   authors,
   publishers,
   genres,
   formats,
   acquisitionSources,
   acquisitionMethods,
   subjects:subjects.filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b))),
   conditions:conditions.filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b))),
   readingStatuses:readingStatuses.filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b)))
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch book filter options",
   error:error.message
  });
 }
};

export const getBookById=async(req,res)=>{
 try{
  const {id}=req.params;

  const book=mongoose.Types.ObjectId.isValid(id)
   ?await applyPopulate(BookModel.findById(id))
   :await applyPopulate(BookModel.findOne({slug:id}));

  if(!book)return res.status(404).json({success:false,message:"Book not found"});

  return res.status(200).json({success:true,book});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch book",error:error.message});
 }
};

export const updateBook=async(req,res)=>{
 try{
  const {id}=req.params;
  const payload=normalizeBookPayload(req.body);

  const book=mongoose.Types.ObjectId.isValid(id)
   ?await BookModel.findById(id)
   :await BookModel.findOne({slug:id});

  if(!book)return res.status(404).json({success:false,message:"Book not found"});

  Object.assign(book,payload);
  await book.save();

  const populated=await applyPopulate(BookModel.findById(book._id));

  return res.status(200).json({success:true,message:"Book updated successfully",book:await populated});
 }catch(error){
  console.error("UPDATE BOOK ERROR:",error);

  if(error.code===11000){
   return res.status(409).json({success:false,message:"Book slug already exists",error:error.message});
  }

  if(error.name==="ValidationError"){
   const firstError=Object.values(error.errors||{})[0];
   return res.status(400).json({success:false,message:firstError?.message||"Validation failed",error:error.message});
  }

  if(error.name==="CastError"){
   return res.status(400).json({success:false,message:`Invalid value for ${error.path}`,error:error.message});
  }

  return res.status(500).json({success:false,message:error.message||"Failed to update book",error:error.message});
 }
};

export const deleteBook=async(req,res)=>{
 try{
  const {id}=req.params;

  const book=mongoose.Types.ObjectId.isValid(id)
   ?await BookModel.findByIdAndDelete(id)
   :await BookModel.findOneAndDelete({slug:id});

  if(!book)return res.status(404).json({success:false,message:"Book not found"});

  return res.status(200).json({success:true,message:"Book deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete book",error:error.message});
 }
};
