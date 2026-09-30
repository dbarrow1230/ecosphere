import MarineCode from "../../models/reference/marineCodeModel.js";

const getId=value=>String(value?._id?.$oid||value?._id||value?.$oid||value?.id||value||"");
const cleanArray=value=>Array.isArray(value)?value.map(item=>String(item).trim()).filter(Boolean):String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
const getBusinessId=req=>getId(req.query.business_id||req.query.business||req.body.business_id||req.body.business);
const getUserId=req=>getId(req.user?._id||req.user?.id);

const buildSearch=query=>{
 const search=String(query||"").trim();
 if(!search)return {};
 const regex=new RegExp(search,"i");
 return {$or:[
  {code:regex},
  {title:regex},
  {meaning:regex},
  {category:regex},
  {frequency:regex},
  {channel:regex},
  {usage:regex},
  {procedure:regex},
  {sourceName:regex},
  {sourceUrl:regex},
  {jurisdiction:regex},
  {notes:regex},
  {aliases:regex}
 ]};
};

export const getMarineCodes=async(req,res)=>{
 try{
  const business_id=getBusinessId(req);
  if(!business_id)return res.status(400).json({message:"Business is required."});

  const filter={business_id,...buildSearch(req.query.search)};
  if(req.query.category)filter.category=req.query.category;
  if(req.query.isActive==="true")filter.isActive=true;
  if(req.query.isActive==="false")filter.isActive=false;

  const records=await MarineCode.find(filter).sort({category:1,code:1,title:1});
  res.json(records);
 }catch(error){
  res.status(500).json({message:error.message||"Failed to load marine codes."});
 }
};

export const getMarineCode=async(req,res)=>{
 try{
  const business_id=getBusinessId(req);
  if(!business_id)return res.status(400).json({message:"Business is required."});

  const record=await MarineCode.findOne({_id:req.params.id,business_id});
  if(!record)return res.status(404).json({message:"Marine code not found."});

  res.json(record);
 }catch(error){
  res.status(500).json({message:error.message||"Failed to load marine code."});
 }
};

export const createMarineCode=async(req,res)=>{
 try{
  const business_id=getBusinessId(req);
  if(!business_id)return res.status(400).json({message:"Business is required."});

  const record=await MarineCode.create({
   business_id,
   code:req.body.code,
   title:req.body.title,
   meaning:req.body.meaning,
   category:req.body.category,
   frequency:req.body.frequency,
   channel:req.body.channel,
   usage:req.body.usage,
   procedure:req.body.procedure,
   sourceName:req.body.sourceName,
   sourceUrl:req.body.sourceUrl,
   jurisdiction:req.body.jurisdiction,
   notes:req.body.notes,
   aliases:cleanArray(req.body.aliases),
   isActive:req.body.isActive!==false,
   isSystem:req.body.isSystem===true,
   createdBy:getUserId(req)||null,
   updatedBy:getUserId(req)||null
  });

  res.status(201).json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"That marine code already exists for this business."});
  res.status(500).json({message:error.message||"Failed to create marine code."});
 }
};

export const updateMarineCode=async(req,res)=>{
 try{
  const business_id=getBusinessId(req);
  if(!business_id)return res.status(400).json({message:"Business is required."});

  const update={
   code:req.body.code,
   title:req.body.title,
   meaning:req.body.meaning,
   category:req.body.category,
   frequency:req.body.frequency,
   channel:req.body.channel,
   usage:req.body.usage,
   procedure:req.body.procedure,
   sourceName:req.body.sourceName,
   sourceUrl:req.body.sourceUrl,
   jurisdiction:req.body.jurisdiction,
   notes:req.body.notes,
   aliases:cleanArray(req.body.aliases),
   isActive:req.body.isActive!==false,
   isSystem:req.body.isSystem===true,
   updatedBy:getUserId(req)||null
  };

  const record=await MarineCode.findOneAndUpdate(
   {_id:req.params.id,business_id},
   update,
   {returnDocument:"after",runValidators:true}
  );

  if(!record)return res.status(404).json({message:"Marine code not found."});
  res.json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"That marine code already exists for this business."});
  res.status(500).json({message:error.message||"Failed to update marine code."});
 }
};

export const deleteMarineCode=async(req,res)=>{
 try{
  const business_id=getBusinessId(req);
  if(!business_id)return res.status(400).json({message:"Business is required."});

  const record=await MarineCode.findOne({_id:req.params.id,business_id});
  if(!record)return res.status(404).json({message:"Marine code not found."});
  if(record.isSystem)return res.status(400).json({message:"System marine codes cannot be deleted."});

  await record.deleteOne();
  res.json({message:"Marine code deleted."});
 }catch(error){
  res.status(500).json({message:error.message||"Failed to delete marine code."});
 }
};