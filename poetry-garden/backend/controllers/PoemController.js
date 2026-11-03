// backend/controllers/PoemController.js
import mongoose from "mongoose";
import PoemModel from "../models/PoemModel.js";
import AuthorModel from "../models/AuthorModel.js";
import GenreModel from "../models/GenreModel.js";
import PublisherModel from "../models/PublisherModel.js";

const normalizeStringArray=value=>{
 if(!Array.isArray(value))return [];
 return value
 .map(item=>String(item||"").trim())
 .filter(Boolean);
};

const normalizeDefinitions=(definitions)=>{
 if(!Array.isArray(definitions))return [];
 return definitions
 .map((item)=>({
  term:item?.term?.trim()||"",
  meaning:item?.meaning?.trim()||""
 }))
 .filter((item)=>item.term&&item.meaning);
};

const normalizeAnalysis=(analysis={})=>({
 formStructure:analysis?.formStructure?.trim()||"",
 theme:normalizeStringArray(analysis?.theme),
 tone:normalizeStringArray(analysis?.tone),
 language:normalizeStringArray(analysis?.language),
 structure:normalizeStringArray(analysis?.structure),
 personalInterpretation:normalizeStringArray(analysis?.personalInterpretation),
 broaderContextReflection:normalizeStringArray(analysis?.broaderContextReflection),
 overall:analysis?.overall?.trim()||""
});

const buildBackgroundImage=(backgroundImage={})=>({
 url:backgroundImage?.url?.trim()||"",
 alt:backgroundImage?.alt?.trim()||"",
 caption:backgroundImage?.caption?.trim()||"",
 isActive:backgroundImage?.isActive!==undefined?Boolean(backgroundImage.isActive):true
});

const normalizeDate=value=>{
 if(!value)return null;
 const date=new Date(value);
 return Number.isNaN(date.getTime())?null:date;
};

const normalizeString=value=>String(value||"").trim();

const allowedPoemStatuses=new Set(["draft","in-progress","incomplete","revision","finished","complete","archived"]);
const blockedPublishingStatuses=new Set(["draft","incomplete"]);

const normalizePoemStatus=value=>{
 const status=String(value||"").trim().toLowerCase();
 if(status==="complete")return "finished";
 return allowedPoemStatuses.has(status)?status:"finished";
};

const canPublishPoemStatus=status=>!blockedPublishingStatuses.has(normalizePoemStatus(status));

const normalizePublishedWhere=value=>{
 if(Array.isArray(value))return normalizeStringArray(value);
 return normalizeStringArray(String(value||"").split(","));
};

const syncGenreHierarchy=async({genreId,section="",subsection=""})=>{
 const normalizedSection=normalizeString(section);
 const normalizedSubsection=normalizeString(subsection);

 if(!genreId||!mongoose.Types.ObjectId.isValid(genreId)||!normalizedSection)return;

 const genre=await GenreModel.findById(genreId);
 if(!genre)return;

 const sections=Array.isArray(genre.sections)?genre.sections:[];
 const existingSection=sections.find(item=>String(item?.name||"").trim().toLowerCase()===normalizedSection.toLowerCase());

 if(existingSection){
  const subsections=Array.isArray(existingSection.subsections)?existingSection.subsections:[];
  if(normalizedSubsection&&!subsections.some(item=>String(item||"").trim().toLowerCase()===normalizedSubsection.toLowerCase())){
   existingSection.subsections=[...subsections,normalizedSubsection];
   await genre.save();
  }
  return;
 }

 genre.sections=[
  ...sections,
  {
   name:normalizedSection,
   subsections:normalizedSubsection?[normalizedSubsection]:[]
  }
 ];

 await genre.save();
};

const resolveFeaturedAt=({isFeatured,requestedFeaturedAt,currentFeaturedAt=null})=>{
 if(!isFeatured)return null;
 return normalizeDate(requestedFeaturedAt)||normalizeDate(currentFeaturedAt)||new Date();
};

const slugify=value=>{
 return String(value||"")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g,"")
  .replace(/\s+/g,"-")
  .replace(/-+/g,"-")
  .replace(/^-+|-+$/g,"");
};

const escapeRegex=value=>{
 return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
};

const poemPopulate=[
 {path:"author",model:AuthorModel,select:"firstName middleName lastName displayName slug bio"},
 {path:"genre",model:GenreModel,select:"name"},
 {path:"publisher",model:PublisherModel,select:"name publisherType imprint website"}
];

const getSlugExists=async(slug,id="")=>{
 const query={slug};
 if(id&&mongoose.Types.ObjectId.isValid(id)){
  query._id={$ne:id};
 }
 const existing=await PoemModel.findOne(query).select("_id slug title subtitle").lean();
 return existing;
};

const getAvailableSlug=async({title="",subtitle="",slug="",id=""})=>{
 const titleSlug=slugify(title);
 const subtitleSlug=slugify(subtitle);
 const manualSlug=slugify(slug);
 const baseSlug=manualSlug||titleSlug;

 if(!baseSlug)return{slug:"",exists:false,suggestedSlug:""};

 const existingBase=await getSlugExists(baseSlug,id);

 if(!existingBase){
  return{slug:baseSlug,exists:false,suggestedSlug:baseSlug};
 }

 if(subtitleSlug&&!manualSlug){
  const titleSubtitleSlug=`${titleSlug}-${subtitleSlug}`;
  const existingTitleSubtitle=await getSlugExists(titleSubtitleSlug,id);

  if(!existingTitleSubtitle){
   return{slug:baseSlug,exists:true,suggestedSlug:titleSubtitleSlug};
  }

  let counter=1;
  let nextSlug=`${titleSubtitleSlug}-${counter}`;
  let existingNext=await getSlugExists(nextSlug,id);

  while(existingNext){
   counter+=1;
   nextSlug=`${titleSubtitleSlug}-${counter}`;
   existingNext=await getSlugExists(nextSlug,id);
  }

  return{slug:baseSlug,exists:true,suggestedSlug:nextSlug};
 }

 let counter=1;
 let nextSlug=`${baseSlug}-${counter}`;
 let existingNext=await getSlugExists(nextSlug,id);

 while(existingNext){
  counter+=1;
  nextSlug=`${baseSlug}-${counter}`;
  existingNext=await getSlugExists(nextSlug,id);
 }

 return{slug:baseSlug,exists:true,suggestedSlug:nextSlug};
};

const buildSearchQuery=search=>{
 const value=String(search||"").trim();

 if(!value)return [];

 return[
  {title:{$regex:value,$options:"i"}},
  {subtitle:{$regex:value,$options:"i"}},
  {slug:{$regex:value,$options:"i"}},
  {collection:{$regex:value,$options:"i"}},
  {section:{$regex:value,$options:"i"}},
  {subsection:{$regex:value,$options:"i"}},
  {status:{$regex:value,$options:"i"}},
  {publishedWhere:{$regex:value,$options:"i"}},
  {content:{$regex:value,$options:"i"}},
  {authorNote:{$regex:value,$options:"i"}},
  {"analysis.formStructure":{$regex:value,$options:"i"}},
  {"analysis.theme":{$regex:value,$options:"i"}},
  {"analysis.tone":{$regex:value,$options:"i"}},
  {"analysis.language":{$regex:value,$options:"i"}},
  {"analysis.structure":{$regex:value,$options:"i"}},
  {"analysis.personalInterpretation":{$regex:value,$options:"i"}},
  {"analysis.broaderContextReflection":{$regex:value,$options:"i"}},
  {"analysis.overall":{$regex:value,$options:"i"}},
  {"definitions.term":{$regex:value,$options:"i"}},
  {"definitions.meaning":{$regex:value,$options:"i"}}
 ];
};

const getPoems=async(req,res)=>{
 try{
  const {
   search="",
   author="",
   genre="",
   publisher="",
   collection="",
   section="",
   subsection="",
   status="",
   featured="",
   published="",
   sort="createdAt",
   order="desc"
  }=req.query;

  const query={};
  const searchQuery=buildSearchQuery(search);

  if(searchQuery.length){
   query.$or=searchQuery;
  }

  if(author&&mongoose.Types.ObjectId.isValid(author))query.author=author;
  if(genre&&mongoose.Types.ObjectId.isValid(genre))query.genre=genre;
  if(publisher&&mongoose.Types.ObjectId.isValid(publisher))query.publisher=publisher;
  if(collection)query.collection=collection;
  if(section)query.section=section;
  if(subsection)query.subsection=subsection;
  if(status){
   const normalizedStatus=normalizePoemStatus(status);
   query.status=normalizedStatus==="finished"?{$in:["finished","complete"]}:normalizedStatus;
  }
  if(featured==="true"||featured==="false")query.isFeatured=featured==="true";
  if(published==="true"||published==="false")query.isPublished=published==="true";

  const sortOrder=order==="asc"?1:-1;
  const allowedSort=["title","subtitle","slug","collection","section","subsection","status","copyright","featuredAt","createdAt","updatedAt"];
  const sortField=allowedSort.includes(sort)?sort:"createdAt";

  const poems=await PoemModel.find(query)
  .populate(poemPopulate)
  .sort({[sortField]:sortOrder});

  res.json(poems);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

const getPoemById=async(req,res)=>{
 try{
  const poem=await PoemModel.findById(req.params.id)
  .populate(poemPopulate);

  if(!poem){
   return res.status(404).json({message:"Poem not found"});
  }

  res.json(poem);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

const getPoemBySlug=async(req,res)=>{
 try{
  const slug=String(req.params.slug||"").trim().toLowerCase();

  const poem=await PoemModel.findOne({slug})
  .populate(poemPopulate);

  if(!poem){
   return res.status(404).json({message:"Poem not found"});
  }

  res.json(poem);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

const getPoemBySlugOrTitle=async(req,res)=>{
 try{
  const value=String(req.params.value||"").trim();

  const poem=await PoemModel.findOne({
   $or:[
    {slug:value.toLowerCase()},
    {title:{$regex:`^${escapeRegex(value)}$`,$options:"i"}}
   ]
  })
  .populate(poemPopulate);

  if(!poem){
   return res.status(404).json({message:"Poem not found"});
  }

  res.json(poem);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

const checkPoemSlug=async(req,res)=>{
 try{
  const result=await getAvailableSlug({
   title:req.query.title||"",
   subtitle:req.query.subtitle||"",
   slug:req.query.slug||"",
   id:req.query.id||""
  });

  res.json(result);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

const createPoem=async(req,res)=>{
 try{
  const slugResult=await getAvailableSlug({
   title:req.body.title||"",
   subtitle:req.body.subtitle||"",
   slug:req.body.slug||""
  });

  if(!slugResult.suggestedSlug){
   return res.status(400).json({message:"Slug could not be created."});
  }

  if(slugResult.exists&&req.body.slug&&slugify(req.body.slug)===slugResult.slug){
   return res.status(409).json({
    message:"Slug already exists.",
    slug:slugResult.slug,
    suggestedSlug:slugResult.suggestedSlug
   });
  }

  const status=normalizePoemStatus(req.body.status||"draft");
  const publishAllowed=canPublishPoemStatus(status);
  const requestedFeatured=req.body.isFeatured!==undefined?Boolean(req.body.isFeatured):false;
  const requestedPublished=req.body.isPublished!==undefined?Boolean(req.body.isPublished):false;
  const isFeatured=publishAllowed&&requestedFeatured;
  const isPublished=publishAllowed&&requestedPublished;

  const collection=normalizeString(req.body.collection)||"Poems";
  const section=normalizeString(req.body.section);
  const subsection=normalizeString(req.body.subsection);

  const poem=new PoemModel({
   title:req.body.title?.trim()||"",
   subtitle:req.body.subtitle?.trim()||"",
   slug:slugResult.suggestedSlug,
   author:req.body.author||null,
   genre:req.body.genre||null,
   publisher:req.body.publisher||null,
   collection,
   section,
   subsection,
   copyright:req.body.copyright||null,
   content:req.body.content?.trim()||"",
   backgroundImage:buildBackgroundImage(req.body.backgroundImage),
   authorNote:req.body.authorNote?.trim()||"",
   analysis:normalizeAnalysis(req.body.analysis),
   definitions:normalizeDefinitions(req.body.definitions),
   status,
   isFeatured,
   featuredAt:resolveFeaturedAt({isFeatured,requestedFeaturedAt:req.body.featuredAt}),
   isPublished,
   publishedWhere:isPublished?normalizePublishedWhere(req.body.publishedWhere):[]
  });

  const createdPoem=await poem.save();
  await syncGenreHierarchy({genreId:createdPoem.genre,section:createdPoem.section,subsection:createdPoem.subsection});

  const populatedPoem=await PoemModel.findById(createdPoem._id)
  .populate(poemPopulate);

  res.status(201).json(populatedPoem);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

const updatePoem=async(req,res)=>{
 try{
  const poem=await PoemModel.findById(req.params.id);

  if(!poem){
   return res.status(404).json({message:"Poem not found"});
  }

  const nextTitle=req.body.title!==undefined?req.body.title?.trim()||"":poem.title;
  const nextSubtitle=req.body.subtitle!==undefined?req.body.subtitle?.trim()||"":poem.subtitle;
  const nextSlug=req.body.slug!==undefined?req.body.slug?.trim()||"":poem.slug;

  const slugResult=await getAvailableSlug({
   title:nextTitle,
   subtitle:nextSubtitle,
   slug:nextSlug,
   id:poem._id
  });

  if(!slugResult.suggestedSlug){
   return res.status(400).json({message:"Slug could not be created."});
  }

  if(slugResult.exists&&nextSlug&&slugify(nextSlug)===slugResult.slug){
   return res.status(409).json({
    message:"Slug already exists.",
    slug:slugResult.slug,
    suggestedSlug:slugResult.suggestedSlug
   });
  }

  poem.title=nextTitle;
  poem.subtitle=nextSubtitle;
  poem.slug=slugResult.suggestedSlug;
  poem.author=req.body.author!==undefined?req.body.author||null:poem.author;
  poem.genre=req.body.genre!==undefined?req.body.genre||null:poem.genre;
  poem.publisher=req.body.publisher!==undefined?req.body.publisher||null:poem.publisher;
  poem.collection=req.body.collection!==undefined?normalizeString(req.body.collection)||"Poems":poem.collection;
  poem.section=req.body.section!==undefined?normalizeString(req.body.section):poem.section;
  poem.subsection=req.body.subsection!==undefined?normalizeString(req.body.subsection):poem.subsection;
  poem.copyright=req.body.copyright!==undefined?req.body.copyright||null:poem.copyright;
  poem.content=req.body.content!==undefined?req.body.content?.trim()||"":poem.content;
  poem.backgroundImage=req.body.backgroundImage!==undefined?buildBackgroundImage(req.body.backgroundImage):poem.backgroundImage;
  poem.authorNote=req.body.authorNote!==undefined?req.body.authorNote?.trim()||"":poem.authorNote;
  poem.analysis=req.body.analysis!==undefined?normalizeAnalysis(req.body.analysis):poem.analysis;
  poem.definitions=req.body.definitions!==undefined?normalizeDefinitions(req.body.definitions):poem.definitions;
  const nextStatus=req.body.status!==undefined?normalizePoemStatus(req.body.status):normalizePoemStatus(poem.status);
  const publishAllowed=canPublishPoemStatus(nextStatus);
  const requestedFeatured=req.body.isFeatured!==undefined?Boolean(req.body.isFeatured):poem.isFeatured;
  const requestedPublished=req.body.isPublished!==undefined?Boolean(req.body.isPublished):poem.isPublished;
  const nextIsFeatured=publishAllowed&&requestedFeatured;
  const nextIsPublished=publishAllowed&&requestedPublished;

  poem.status=nextStatus;

  poem.isFeatured=nextIsFeatured;
  poem.featuredAt=resolveFeaturedAt({
   isFeatured:nextIsFeatured,
   requestedFeaturedAt:req.body.featuredAt,
   currentFeaturedAt:poem.featuredAt
  });
  poem.isPublished=nextIsPublished;
  poem.publishedWhere=nextIsPublished
   ?normalizePublishedWhere(req.body.publishedWhere!==undefined?req.body.publishedWhere:poem.publishedWhere)
   :[];

  const updatedPoem=await poem.save();
  await syncGenreHierarchy({genreId:updatedPoem.genre,section:updatedPoem.section,subsection:updatedPoem.subsection});

  const populatedPoem=await PoemModel.findById(updatedPoem._id)
  .populate(poemPopulate);

  res.json(populatedPoem);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

const deletePoem=async(req,res)=>{
 try{
  const poem=await PoemModel.findById(req.params.id);

  if(!poem){
   return res.status(404).json({message:"Poem not found"});
  }

  await poem.deleteOne();
  res.json({message:"Poem removed"});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export {getPoems,getPoemById,getPoemBySlug,getPoemBySlugOrTitle,checkPoemSlug,createPoem,updatePoem,deletePoem};
