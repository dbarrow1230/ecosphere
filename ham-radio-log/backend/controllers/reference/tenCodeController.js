import TenCode from "../../models/reference/tenCodeModel.js";

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
  {city:regex},
  {state:regex},
  {agency:regex},
  {jurisdiction:regex},
  {sourceName:regex},
  {sourceUrl:regex},
  {notes:regex},
  {aliases:regex}
 ]};
};

const buildFilter=req=>{
 const business_id=getBusinessId(req);
 const filter={business_id,...buildSearch(req.query.search)};

 if(req.query.city)filter.city=req.query.city;
 if(req.query.state)filter.state=String(req.query.state).toUpperCase();
 if(req.query.agency)filter.agency=req.query.agency;
 if(req.query.category)filter.category=req.query.category;
 if(req.query.isActive==="true")filter.isActive=true;
 if(req.query.isActive==="false")filter.isActive=false;

 return filter;
};

export const getTenCodes=async(req,res)=>{
 try{
  const business_id=getBusinessId(req);
  if(!business_id)return res.status(400).json({message:"Business is required."});

  const records=await TenCode.find(buildFilter(req)).sort({state:1,city:1,agency:1,code:1});
  res.json(records);
 }catch(error){
  res.status(500).json({message:error.message||"Failed to load ten codes."});
 }
};

export const getTenCode=async(req,res)=>{
 try{
  const business_id=getBusinessId(req);
  if(!business_id)return res.status(400).json({message:"Business is required."});

  const record=await TenCode.findOne({_id:req.params.id,business_id});
  if(!record)return res.status(404).json({message:"Ten code not found."});

  res.json(record);
 }catch(error){
  res.status(500).json({message:error.message||"Failed to load ten code."});
 }
};

export const createTenCode=async(req,res)=>{
 try{
  const business_id=getBusinessId(req);
  if(!business_id)return res.status(400).json({message:"Business is required."});

  const record=await TenCode.create({
   business_id,
   code:req.body.code,
   title:req.body.title,
   meaning:req.body.meaning,
   category:req.body.category,
   city:req.body.city,
   state:req.body.state,
   agency:req.body.agency,
   jurisdiction:req.body.jurisdiction,
   sourceName:req.body.sourceName,
   sourceUrl:req.body.sourceUrl,
   notes:req.body.notes,
   aliases:cleanArray(req.body.aliases),
   isActive:req.body.isActive!==false,
   isSystem:req.body.isSystem===true,
   createdBy:getUserId(req)||null,
   updatedBy:getUserId(req)||null
  });

  res.status(201).json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"That ten code already exists for this business, city, state, agency, and code."});
  res.status(500).json({message:error.message||"Failed to create ten code."});
 }
};

export const updateTenCode=async(req,res)=>{
 try{
  const business_id=getBusinessId(req);
  if(!business_id)return res.status(400).json({message:"Business is required."});

  const update={
   code:req.body.code,
   title:req.body.title,
   meaning:req.body.meaning,
   category:req.body.category,
   city:req.body.city,
   state:req.body.state,
   agency:req.body.agency,
   jurisdiction:req.body.jurisdiction,
   sourceName:req.body.sourceName,
   sourceUrl:req.body.sourceUrl,
   notes:req.body.notes,
   aliases:cleanArray(req.body.aliases),
   isActive:req.body.isActive!==false,
   isSystem:req.body.isSystem===true,
   updatedBy:getUserId(req)||null
  };

  const record=await TenCode.findOneAndUpdate(
   {_id:req.params.id,business_id},
   update,
   {returnDocument:"after",runValidators:true}
  );

  if(!record)return res.status(404).json({message:"Ten code not found."});
  res.json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"That ten code already exists for this business, city, state, agency, and code."});
  res.status(500).json({message:error.message||"Failed to update ten code."});
 }
};

export const deleteTenCode=async(req,res)=>{
 try{
  const business_id=getBusinessId(req);
  if(!business_id)return res.status(400).json({message:"Business is required."});

  const record=await TenCode.findOne({_id:req.params.id,business_id});
  if(!record)return res.status(404).json({message:"Ten code not found."});
  if(record.isSystem)return res.status(400).json({message:"System ten codes cannot be deleted."});

  await record.deleteOne();
  res.json({message:"Ten code deleted."});
 }catch(error){
  res.status(500).json({message:error.message||"Failed to delete ten code."});
 }
};