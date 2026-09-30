// /backend/controllers/currencyController.js
import Currency from '../models/currencyModel.js';
import Country from '../models/locations/countryModel.js';;

export const createCurrency=async(req,res)=>{
try{
const{name,code,symbol,country,isActive}=req.body;
if(!name||!code)return res.status(400).json({success:false,message:'Name and code are required'});
const existing=await Currency.findOne({code:code.trim().toUpperCase()});
if(existing)return res.status(409).json({success:false,message:'Currency code already exists'});
const currency=await Currency.create({name,code,symbol,country,isActive});
res.status(201).json({success:true,message:'Currency created successfully',currency});
}catch(error){
res.status(500).json({success:false,message:'Error creating currency',error:error.message});
}
};

export const getCurrencies=async(req,res)=>{
try{
const currencies=await Currency.find({}).populate({path:'country',model:Country}).sort({createdAt:-1});
res.status(200).json({success:true,count:currencies.length,currencies});
}catch(error){
res.status(500).json({success:false,message:'Error fetching currencies',error:error.message});
}
};

export const getActiveCurrencies=async(req,res)=>{
try{
const currencies=await Currency.find({isActive:true}).populate({path:'country',model:Country}).sort({name:1});
res.status(200).json({success:true,count:currencies.length,currencies});
}catch(error){
res.status(500).json({success:false,message:'Error fetching active currencies',error:error.message});
}
};

export const getCurrencyById=async(req,res)=>{
try{
const currency=await Currency.findById(req.params.id).populate({path:'country',model:Country});
if(!currency)return res.status(404).json({success:false,message:'Currency not found'});
res.status(200).json({success:true,currency});
}catch(error){
res.status(500).json({success:false,message:'Error fetching currency',error:error.message});
}
};

export const getCurrencyByCode=async(req,res)=>{
try{
const currency=await Currency.findOne({code:req.params.code.trim().toUpperCase()}).populate({path:'country',model:Country});
if(!currency)return res.status(404).json({success:false,message:'Currency not found'});
res.status(200).json({success:true,currency});
}catch(error){
res.status(500).json({success:false,message:'Error fetching currency',error:error.message});
}
};

export const updateCurrency=async(req,res)=>{
try{
const{name,code,symbol,country,isActive}=req.body;
const currencyDoc=await Currency.findById(req.params.id);
if(!currencyDoc)return res.status(404).json({success:false,message:'Currency not found'});
if(code&&code.trim().toUpperCase()!==currencyDoc.code){
const existingCode=await Currency.findOne({code:code.trim().toUpperCase(),_id:{$ne:req.params.id}});
if(existingCode)return res.status(409).json({success:false,message:'Currency code already exists'});
}
currencyDoc.name=name??currencyDoc.name;
currencyDoc.code=code?code.trim().toUpperCase():currencyDoc.code;
currencyDoc.symbol=symbol??currencyDoc.symbol;
currencyDoc.country=country!==undefined?country:currencyDoc.country;
currencyDoc.isActive=isActive!==undefined?isActive:currencyDoc.isActive;
await currencyDoc.save();
const updatedCurrency=await Currency.findById(currencyDoc._id).populate({path:'country',model:Country});
res.status(200).json({success:true,message:'Currency updated successfully',currency:updatedCurrency});
}catch(error){
res.status(500).json({success:false,message:'Error updating currency',error:error.message});
}
};

export const deleteCurrency=async(req,res)=>{
try{
const currency=await Currency.findById(req.params.id);
if(!currency)return res.status(404).json({success:false,message:'Currency not found'});
await Currency.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Currency deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting currency',error:error.message});
}
};