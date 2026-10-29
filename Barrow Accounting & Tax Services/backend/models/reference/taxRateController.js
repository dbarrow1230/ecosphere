// backend/controllers/reference/taxRateController.js
import TaxRate from "../../models/reference/TaxRateModel.js";

const getObjectId=value=>{
 if(!value)return null;
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value?._id||value?.id||value?.value||"")||null;
 return null;
};

const buildCode=value=>{
 const raw=String(value||"").trim().toLowerCase();
 if(!raw)return "";
 return raw.replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
};

export const getTaxRates=async(req,res)=>{
 try{
  const query={};
  if(req.query.stateRef)query.stateRef=getObjectId(req.query.stateRef);
  if(req.query.isActive==="true")query.isActive=true;
  if(req.query.isActive==="false")query.isActive=false;
  if(req.query.isDefault==="true")query.isDefault=true;
  if(req.query.isDefault==="false")query.isDefault=false;

  const rows=await TaxRate.find(query)
   .populate("stateRef")
   .sort({name:1});

  return res.json(rows);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch tax rates.",error:error.message});
 }
};

export const getTaxRateById=async(req,res)=>{
 try{
  const row=await TaxRate.findById(req.params.id).populate("stateRef");
  if(!row)return res.status(404).json({message:"Tax rate not found."});
  return res.json(row);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch tax rate.",error:error.message});
 }
};

export const createTaxRate=async(req,res)=>{
 try{
  const payload={
   name:String(req.body.name||"").trim(),
   code:buildCode(req.body.code||req.body.name),
   stateRef:getObjectId(req.body.stateRef),
   rate:req.body.rate===""||req.body.rate===undefined||req.body.rate===null?0:Number(req.body.rate),
   isDefault:!!req.body.isDefault,
   isActive:req.body.isActive!==false,
   notes:String(req.body.notes||"").trim()
  };

  if(!payload.name)return res.status(400).json({message:"Name is required."});
  if(!payload.stateRef)return res.status(400).json({message:"State is required."});

  if(payload.isDefault){
   await TaxRate.updateMany({stateRef:payload.stateRef,isDefault:true},{$set:{isDefault:false}});
  }

  const row=await TaxRate.create(payload);
  const savedRow=await TaxRate.findById(row._id).populate("stateRef");

  return res.status(201).json(savedRow);
 }catch(error){
  if(error?.code===11000){
   return res.status(400).json({message:"A tax rate with that name or code already exists for this state.",error:error.message});
  }
  return res.status(500).json({message:"Failed to create tax rate.",error:error.message});
 }
};

export const updateTaxRate=async(req,res)=>{
 try{
  const existing=await TaxRate.findById(req.params.id);
  if(!existing)return res.status(404).json({message:"Tax rate not found."});

  const nextStateRef=getObjectId(req.body.stateRef)||getObjectId(existing.stateRef);
  const nextIsDefault=req.body.isDefault===undefined?existing.isDefault:!!req.body.isDefault;

  if(nextIsDefault){
   await TaxRate.updateMany({_id:{$ne:existing._id},stateRef:nextStateRef,isDefault:true},{$set:{isDefault:false}});
  }

  existing.name=req.body.name!==undefined?String(req.body.name||"").trim():existing.name;
  existing.code=req.body.code!==undefined?buildCode(req.body.code):existing.code;
  existing.stateRef=nextStateRef;
  existing.rate=req.body.rate!==undefined&&req.body.rate!==""?Number(req.body.rate):existing.rate;
  existing.isDefault=nextIsDefault;
  existing.isActive=req.body.isActive!==undefined?!!req.body.isActive:existing.isActive;
  existing.notes=req.body.notes!==undefined?String(req.body.notes||"").trim():existing.notes;

  await existing.save();

  const savedRow=await TaxRate.findById(existing._id).populate("stateRef");

  return res.json(savedRow);
 }catch(error){
  if(error?.code===11000){
   return res.status(400).json({message:"A tax rate with that name or code already exists for this state.",error:error.message});
  }
  return res.status(500).json({message:"Failed to update tax rate.",error:error.message});
 }
};

export const deleteTaxRate=async(req,res)=>{
 try{
  const row=await TaxRate.findByIdAndDelete(req.params.id);
  if(!row)return res.status(404).json({message:"Tax rate not found."});
  return res.json({message:"Tax rate deleted successfully."});
 }catch(error){
  return res.status(500).json({message:"Failed to delete tax rate.",error:error.message});
 }
};