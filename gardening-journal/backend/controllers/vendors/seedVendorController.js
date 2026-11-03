// backend/controllers/vendors/seedVendorController.js
import mongoose from "mongoose";
import SeedVendor from "../../models/vendors/seedVendorModel.js";
import State from "../../models/locations/stateModel.js";
import Country from "../../models/locations/countryModel.js";

const toBool=value=>value===true||value==="true";

export const createSeedVendor=async(req,res)=>{
try{
const {
name,
companyName,
contactName,
email,
phone,
website,
address1,
address2,
city,
state,
postalCode,
country,
isInternational,
description,
logo,
isActive
}=req.body||{};

const vendor=new SeedVendor({
name,
companyName,
contactName:Array.isArray(contactName)?contactName:contactName!==undefined&&contactName!==null&&contactName!==''?[contactName]:[],
email,
phone,
website,
address1,
address2,
city,
state:state||null,
postalCode,
country:country||null,
isInternational:isInternational!==undefined?toBool(isInternational):false,
description,
logo:req.file?.path||logo||'',
isActive:isActive!==undefined?toBool(isActive):true
});

const saved=await vendor.save();
const populated=await SeedVendor.findById(saved._id)
.populate({path:"state",model:State})
.populate({path:"country",model:Country});

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getSeedVendors=async(req,res)=>{
try{
const query={};

if(req.query.state)query.state=req.query.state;
if(req.query.country)query.country=req.query.country;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{companyName:{$regex:req.query.search,$options:"i"}},
{contactName:{$elemMatch:{$regex:req.query.search,$options:"i"}}},
{email:{$regex:req.query.search,$options:"i"}},
{city:{$regex:req.query.search,$options:"i"}}
];
}

const vendors=await SeedVendor.find(query)
.populate({path:"state",model:State})
.populate({path:"country",model:Country})
.sort({createdAt:-1});

return res.status(200).json(vendors);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getSeedVendorById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid vendor id"});
}

const vendor=await SeedVendor.findById(id)
.populate({path:"state",model:State})
.populate({path:"country",model:Country});

if(!vendor){
return res.status(404).json({message:"Vendor not found"});
}

return res.status(200).json(vendor);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const updateSeedVendor=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid vendor id"});
}

const vendor=await SeedVendor.findById(id);
if(!vendor){
return res.status(404).json({message:"Vendor not found"});
}

const {
name,
companyName,
contactName,
email,
phone,
website,
address1,
address2,
city,
state,
postalCode,
country,
isInternational,
description,
logo,
existingLogo,
removeLogo,
isActive
}=req.body||{};

if(name!==undefined)vendor.name=name;
if(companyName!==undefined)vendor.companyName=companyName;
if(contactName!==undefined)vendor.contactName=Array.isArray(contactName)?contactName:contactName!==null&&contactName!==''?[contactName]:[];
if(email!==undefined)vendor.email=email;
if(phone!==undefined)vendor.phone=phone;
if(website!==undefined)vendor.website=website;
if(address1!==undefined)vendor.address1=address1;
if(address2!==undefined)vendor.address2=address2;
if(city!==undefined)vendor.city=city;
if(state!==undefined)vendor.state=state||null;
if(postalCode!==undefined)vendor.postalCode=postalCode;
if(country!==undefined)vendor.country=country||null;
if(isInternational!==undefined)vendor.isInternational=toBool(isInternational);
if(description!==undefined)vendor.description=description;
if(removeLogo==="true")vendor.logo='';
else if(req.file?.path)vendor.logo=req.file.path;
else if(existingLogo!==undefined)vendor.logo=existingLogo;
else if(logo!==undefined)vendor.logo=logo;
if(isActive!==undefined)vendor.isActive=toBool(isActive);

const updated=await vendor.save();
const populated=await SeedVendor.findById(updated._id)
.populate({path:"state",model:State})
.populate({path:"country",model:Country});

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteSeedVendor=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid vendor id"});
}

const vendor=await SeedVendor.findByIdAndDelete(id);
if(!vendor){
return res.status(404).json({message:"Vendor not found"});
}

return res.status(200).json({message:"Vendor deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};