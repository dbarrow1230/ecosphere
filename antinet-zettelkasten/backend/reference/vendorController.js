// backend/controllers/reference/vendorController.js
import Vendor from "../../models/reference/vendorModel.js";

const getObjectId=value=>{
 if(!value)return null;
 if(typeof value==="string")return value.trim()||null;
 if(typeof value==="object")return String(value?._id||value?.id||value?.value||"").trim()||null;
 return null;
};

const cleanString=value=>String(value||"").trim();

const cleanNumber=value=>{
 const number=Number(value);
 return Number.isFinite(number)?number:0;
};

const normalizeVendorPayload=payload=>{
 const payment=payload.payment&&typeof payload.payment==="object"?payload.payment:{};
 const ordering=payload.ordering&&typeof payload.ordering==="object"?payload.ordering:{};
 const performance=payload.performance&&typeof payload.performance==="object"?payload.performance:{};
 const compliance=payload.compliance&&typeof payload.compliance==="object"?payload.compliance:{};

 return{
  business_id:getObjectId(payload.business_id),
  legalName:cleanString(payload.legalName),
  code:cleanString(payload.code).toUpperCase()||null,
  dbaName:cleanString(payload.dbaName),
  vendorCategory:cleanString(payload.vendorCategory),
  website:cleanString(payload.website),
  logo:cleanString(payload.logo),
  email:cleanString(payload.email).toLowerCase(),
  phone:cleanString(payload.phone),
  fax:cleanString(payload.fax),
  contacts:Array.isArray(payload.contacts)?payload.contacts:[],
  addresses:Array.isArray(payload.addresses)?payload.addresses:[],
  payment:{
   paymentTerms:cleanString(payment.paymentTerms),
   preferredPaymentMethod:cleanString(payment.preferredPaymentMethod),
   currencyCode:cleanString(payment.currencyCode).toUpperCase()
  },
  ordering:{
   orderingEmail:cleanString(ordering.orderingEmail).toLowerCase(),
   vendorPortalUrl:cleanString(ordering.vendorPortalUrl),
   leadTimeDays:cleanNumber(ordering.leadTimeDays),
   minimumOrderValue:cleanNumber(ordering.minimumOrderValue)
  },
  performance:{
   rating:cleanNumber(performance.rating),
   onTimeRate:cleanNumber(performance.onTimeRate),
   fillRate:cleanNumber(performance.fillRate)
  },
  compliance:{
   taxId:cleanString(compliance.taxId),
   insuranceExpiration:compliance.insuranceExpiration||null,
   notes:cleanString(compliance.notes)
  },
  isPreferred:!!payload.isPreferred,
  isActive:payload.isActive!==undefined?!!payload.isActive:true,
  notes:cleanString(payload.notes)
 };
};

const populateVendor=query=>query.populate({path:"business_id",model:"Business"});

export const getVendors=async(req,res)=>{
 try{
  const filter={};

  if(req.query.business_id)filter.business_id=getObjectId(req.query.business_id);
  if(req.query.business)filter.business_id=getObjectId(req.query.business);
  if(req.query.isActive==="true")filter.isActive=true;
  if(req.query.isActive==="false")filter.isActive=false;
  if(req.query.isPreferred==="true")filter.isPreferred=true;
  if(req.query.isPreferred==="false")filter.isPreferred=false;

  const vendors=await populateVendor(Vendor.find(filter).sort({legalName:1}));
  return res.status(200).json(vendors);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendors",error:error.message});
 }
};

export const getVendorById=async(req,res)=>{
 try{
  const vendor=await populateVendor(Vendor.findById(req.params.id));

  if(!vendor)return res.status(404).json({message:"Vendor not found"});

  return res.status(200).json(vendor);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor",error:error.message});
 }
};

export const createVendor=async(req,res)=>{
 try{
  const payload=normalizeVendorPayload(req.body);

  if(!payload.business_id)return res.status(400).json({message:"Business is required"});
  if(!payload.legalName)return res.status(400).json({message:"Legal name is required"});

  const vendor=await Vendor.create(payload);
  const savedVendor=await populateVendor(Vendor.findById(vendor._id));

  return res.status(201).json(savedVendor);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Vendor already exists for this business",error:error.message});
  return res.status(500).json({message:"Failed to create vendor",error:error.message});
 }
};

export const updateVendor=async(req,res)=>{
 try{
  const existing=await Vendor.findById(req.params.id);

  if(!existing)return res.status(404).json({message:"Vendor not found"});

  const payload=normalizeVendorPayload({
   ...existing.toObject(),
   ...req.body
  });

  if(!payload.business_id)return res.status(400).json({message:"Business is required"});
  if(!payload.legalName)return res.status(400).json({message:"Legal name is required"});

  Object.assign(existing,payload);
  await existing.save();

  const savedVendor=await populateVendor(Vendor.findById(existing._id));

  return res.status(200).json(savedVendor);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Vendor already exists for this business",error:error.message});
  return res.status(500).json({message:"Failed to update vendor",error:error.message});
 }
};

export const deleteVendor=async(req,res)=>{
 try{
  const vendor=await Vendor.findByIdAndDelete(req.params.id);

  if(!vendor)return res.status(404).json({message:"Vendor not found"});

  return res.status(200).json({message:"Vendor deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete vendor",error:error.message});
 }
};
