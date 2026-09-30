// /backend/controllers/brandController.js
import Brand from '../models/brandModel.js';
import Country from '../models/locations/countryModel.js';

export const createBrand=async(req,res)=>{
try{
const{name,slug,description,logo,website,country,isActive}=req.body;
if(!name||!slug)return res.status(400).json({success:false,message:'Name and slug are required'});
const existing=await Brand.findOne({$or:[{name:name.trim()},{slug:slug.trim().toLowerCase()}]});
if(existing)return res.status(409).json({success:false,message:'Brand with this name or slug already exists'});
const brand=await Brand.create({name,slug,description,logo,website,country,isActive});
res.status(201).json({success:true,message:'Brand created successfully',brand});
}catch(error){
res.status(500).json({success:false,message:'Error creating brand',error:error.message});
}
};

export const getBrands=async(req,res)=>{
try{
const brands=await Brand.find({}).populate({path:'country',model:Country}).sort({createdAt:-1});
res.status(200).json({success:true,count:brands.length,brands});
}catch(error){
res.status(500).json({success:false,message:'Error fetching brands',error:error.message});
}
};

export const getActiveBrands=async(req,res)=>{
try{
const brands=await Brand.find({isActive:true}).populate({path:'country',model:Country}).sort({name:1});
res.status(200).json({success:true,count:brands.length,brands});
}catch(error){
res.status(500).json({success:false,message:'Error fetching active brands',error:error.message});
}
};

export const getBrandById=async(req,res)=>{
try{
const brand=await Brand.findById(req.params.id).populate({path:'country',model:Country});
if(!brand)return res.status(404).json({success:false,message:'Brand not found'});
res.status(200).json({success:true,brand});
}catch(error){
res.status(500).json({success:false,message:'Error fetching brand',error:error.message});
}
};

export const getBrandBySlug=async(req,res)=>{
try{
const brand=await Brand.findOne({slug:req.params.slug.trim().toLowerCase()}).populate({path:'country',model:Country});
if(!brand)return res.status(404).json({success:false,message:'Brand not found'});
res.status(200).json({success:true,brand});
}catch(error){
res.status(500).json({success:false,message:'Error fetching brand',error:error.message});
}
};

export const updateBrand=async(req,res)=>{
try{
const{name,slug,description,logo,website,country,isActive}=req.body;
const brand=await Brand.findById(req.params.id);
if(!brand)return res.status(404).json({success:false,message:'Brand not found'});
if(name&&name.trim()!==brand.name){
const existingName=await Brand.findOne({name:name.trim(),_id:{$ne:req.params.id}});
if(existingName)return res.status(409).json({success:false,message:'Brand name already exists'});
}
if(slug&&slug.trim().toLowerCase()!==brand.slug){
const existingSlug=await Brand.findOne({slug:slug.trim().toLowerCase(),_id:{$ne:req.params.id}});
if(existingSlug)return res.status(409).json({success:false,message:'Brand slug already exists'});
}
brand.name=name??brand.name;
brand.slug=slug?slug.trim().toLowerCase():brand.slug;
brand.description=description??brand.description;
brand.logo=logo??brand.logo;
brand.website=website??brand.website;
brand.country=country!==undefined?country:brand.country;
brand.isActive=isActive!==undefined?isActive:brand.isActive;
await brand.save();
const updatedBrand=await Brand.findById(brand._id).populate({path:'country',model:Country});
res.status(200).json({success:true,message:'Brand updated successfully',brand:updatedBrand});
}catch(error){
res.status(500).json({success:false,message:'Error updating brand',error:error.message});
}
};

export const deleteBrand=async(req,res)=>{
try{
const brand=await Brand.findById(req.params.id);
if(!brand)return res.status(404).json({success:false,message:'Brand not found'});
await Brand.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Brand deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting brand',error:error.message});
}
};