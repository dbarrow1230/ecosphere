// /backend/controllers/storeController.js
import Store from '../models/storeModel.js';
import State from '../models/locations/stateModel.js';
import Country from '../models/locations/countryModel.js';

const normalizeObjectIdOrNull=value=>{
if(value===undefined)return undefined;
if(value===null)return null;
if(typeof value==='string'&&!value.trim())return null;
return value;
};

const normalizeString=value=>{
if(value===undefined||value===null)return '';
return String(value).trim();
};

const normalizeLowerString=value=>{
if(value===undefined||value===null)return '';
return String(value).trim().toLowerCase();
};

const normalizeLocation=location=>{
if(!location||typeof location!=='object'){
return {type:'Point',coordinates:[0,0]};
}
const lng=Number(location?.coordinates?.[0]);
const lat=Number(location?.coordinates?.[1]);
return{
type:'Point',
coordinates:[
Number.isFinite(lng)?lng:0,
Number.isFinite(lat)?lat:0
]
};
};

export const createStore=async(req,res)=>{
try{
const name=normalizeString(req.body.name);
const slug=normalizeLowerString(req.body.slug);
const description=normalizeString(req.body.description);
const email=normalizeLowerString(req.body.email);
const phone=normalizeString(req.body.phone);
const website=normalizeString(req.body.website);
const logo=normalizeString(req.body.logo);
const address1=normalizeString(req.body.address1);
const address2=normalizeString(req.body.address2);
const city=normalizeString(req.body.city);
const state=normalizeObjectIdOrNull(req.body.state);
const country=normalizeObjectIdOrNull(req.body.country);
const postalCode=normalizeString(req.body.postalCode);
const location=normalizeLocation(req.body.location);
const isOnline=req.body.isOnline===true;
const isActive=req.body.isActive!==undefined?req.body.isActive:true;

if(!name)return res.status(400).json({success:false,message:'Name is required'});

const query=[{name}];
if(slug)query.push({slug});
if(email)query.push({email});

const existing=await Store.findOne({$or:query});
if(existing)return res.status(409).json({success:false,message:'Store with this name, slug, or email already exists'});

const store=await Store.create({
name,
slug,
description,
email,
phone,
website,
logo,
address1,
address2,
city,
state,
country,
postalCode,
location,
isOnline,
isActive
});

res.status(201).json({success:true,message:'Store created successfully',store});
}catch(error){
res.status(500).json({success:false,message:'Error creating store',error:error.message});
}
};

export const getStores=async(req,res)=>{
try{
const query={};
if(req.query.isOnline!==undefined)query.isOnline=req.query.isOnline==='true';
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==='true';
if(req.query.city)query.city=req.query.city;
if(req.query.state)query.state=req.query.state;
if(req.query.country)query.country=req.query.country;

const stores=await Store.find(query)
.populate({path:'state',model:State})
.populate({path:'country',model:Country})
.sort({createdAt:-1});

res.status(200).json({success:true,count:stores.length,stores});
}catch(error){
res.status(500).json({success:false,message:'Error fetching stores',error:error.message});
}
};

export const getActiveStores=async(req,res)=>{
try{
const query={isActive:true};
if(req.query.isOnline!==undefined)query.isOnline=req.query.isOnline==='true';

const stores=await Store.find(query)
.populate({path:'state',model:State})
.populate({path:'country',model:Country})
.sort({name:1});

res.status(200).json({success:true,count:stores.length,stores});
}catch(error){
res.status(500).json({success:false,message:'Error fetching active stores',error:error.message});
}
};

export const getOnlineStores=async(req,res)=>{
try{
const stores=await Store.find({isOnline:true,isActive:true})
.populate({path:'state',model:State})
.populate({path:'country',model:Country})
.sort({name:1});

res.status(200).json({success:true,count:stores.length,stores});
}catch(error){
res.status(500).json({success:false,message:'Error fetching online stores',error:error.message});
}
};

export const getStoreById=async(req,res)=>{
try{
const store=await Store.findById(req.params.id)
.populate({path:'state',model:State})
.populate({path:'country',model:Country});

if(!store)return res.status(404).json({success:false,message:'Store not found'});
res.status(200).json({success:true,store});
}catch(error){
res.status(500).json({success:false,message:'Error fetching store',error:error.message});
}
};

export const getStoreBySlug=async(req,res)=>{
try{
const store=await Store.findOne({slug:req.params.slug.trim().toLowerCase()})
.populate({path:'state',model:State})
.populate({path:'country',model:Country});

if(!store)return res.status(404).json({success:false,message:'Store not found'});
res.status(200).json({success:true,store});
}catch(error){
res.status(500).json({success:false,message:'Error fetching store',error:error.message});
}
};

export const updateStore=async(req,res)=>{
try{
const store=await Store.findById(req.params.id);
if(!store)return res.status(404).json({success:false,message:'Store not found'});

const name=req.body.name!==undefined?normalizeString(req.body.name):undefined;
const slug=req.body.slug!==undefined?normalizeLowerString(req.body.slug):undefined;
const description=req.body.description!==undefined?normalizeString(req.body.description):undefined;
const email=req.body.email!==undefined?normalizeLowerString(req.body.email):undefined;
const phone=req.body.phone!==undefined?normalizeString(req.body.phone):undefined;
const website=req.body.website!==undefined?normalizeString(req.body.website):undefined;
const logo=req.body.logo!==undefined?normalizeString(req.body.logo):undefined;
const address1=req.body.address1!==undefined?normalizeString(req.body.address1):undefined;
const address2=req.body.address2!==undefined?normalizeString(req.body.address2):undefined;
const city=req.body.city!==undefined?normalizeString(req.body.city):undefined;
const state=normalizeObjectIdOrNull(req.body.state);
const country=normalizeObjectIdOrNull(req.body.country);
const postalCode=req.body.postalCode!==undefined?normalizeString(req.body.postalCode):undefined;
const location=req.body.location!==undefined?normalizeLocation(req.body.location):undefined;
const isOnline=req.body.isOnline;
const isActive=req.body.isActive;

if(name&&name!==store.name){
const existingName=await Store.findOne({name,_id:{$ne:req.params.id}});
if(existingName)return res.status(409).json({success:false,message:'Store name already exists'});
}

if(slug!==undefined&&slug!==store.slug){
if(slug){
const existingSlug=await Store.findOne({slug,_id:{$ne:req.params.id}});
if(existingSlug)return res.status(409).json({success:false,message:'Store slug already exists'});
}
}

if(email!==undefined&&email!==store.email){
if(email){
const existingEmail=await Store.findOne({email,_id:{$ne:req.params.id}});
if(existingEmail)return res.status(409).json({success:false,message:'Store email already exists'});
}
}

store.name=name??store.name;
store.slug=slug!==undefined?slug:store.slug;
store.description=description??store.description;
store.email=email!==undefined?email:store.email;
store.phone=phone??store.phone;
store.website=website??store.website;
store.logo=logo??store.logo;
store.address1=address1??store.address1;
store.address2=address2??store.address2;
store.city=city??store.city;
store.state=state!==undefined?state:store.state;
store.country=country!==undefined?country:store.country;
store.postalCode=postalCode??store.postalCode;
store.location=location??store.location;
store.isOnline=isOnline!==undefined?isOnline:store.isOnline;
store.isActive=isActive!==undefined?isActive:store.isActive;

await store.save();

const updatedStore=await Store.findById(store._id)
.populate({path:'state',model:State})
.populate({path:'country',model:Country});

res.status(200).json({success:true,message:'Store updated successfully',store:updatedStore});
}catch(error){
res.status(500).json({success:false,message:'Error updating store',error:error.message});
}
};

export const deleteStore=async(req,res)=>{
try{
const store=await Store.findById(req.params.id);
if(!store)return res.status(404).json({success:false,message:'Store not found'});

await Store.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Store deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting store',error:error.message});
}
};