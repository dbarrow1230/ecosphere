// backend/controllers/vendors/equipmentVendorController.js
import mongoose from "mongoose";
import EquipmentVendor from "../../models/vendors/equipmentVendorModel.js";
import State from "../../models/locations/stateModel.js";
import Country from "../../models/locations/countryModel.js";

export const createEquipmentVendor=async(req,res)=>{
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
isActive
}=req.body;

const vendor=new EquipmentVendor({
name,
companyName,
contactName,
email,
phone,
website,
address1,
address2,
city,
state:state||null,
postalCode,
country:country||null,
isInternational:isInternational!==undefined?isInternational:false,
description,
isActive:isActive!==undefined?isActive:true
});

const saved=await vendor.save();
const populated=await EquipmentVendor.findById(saved._id)
.populate({path:"state",model:State})
.populate({path:"country",model:Country});

return res.status(201).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getEquipmentVendors=async(req,res)=>{
try{
const query={};

if(req.query.state)query.state=req.query.state;
if(req.query.country)query.country=req.query.country;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==="true";

if(req.query.search){
query.$or=[
{name:{$regex:req.query.search,$options:"i"}},
{companyName:{$regex:req.query.search,$options:"i"}},
{contactName:{$regex:req.query.search,$options:"i"}},
{email:{$regex:req.query.search,$options:"i"}},
{city:{$regex:req.query.search,$options:"i"}}
];
}

const vendors=await EquipmentVendor.find(query)
.populate({path:"state",model:State})
.populate({path:"country",model:Country})
.sort({createdAt:-1});

return res.status(200).json(vendors);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const getEquipmentVendorById=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid vendor id"});
}

const vendor=await EquipmentVendor.findById(id)
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

export const updateEquipmentVendor=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid vendor id"});
}

const vendor=await EquipmentVendor.findById(id);
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
isActive
}=req.body;

if(name!==undefined)vendor.name=name;
if(companyName!==undefined)vendor.companyName=companyName;
if(contactName!==undefined)vendor.contactName=contactName;
if(email!==undefined)vendor.email=email;
if(phone!==undefined)vendor.phone=phone;
if(website!==undefined)vendor.website=website;
if(address1!==undefined)vendor.address1=address1;
if(address2!==undefined)vendor.address2=address2;
if(city!==undefined)vendor.city=city;
if(state!==undefined)vendor.state=state||null;
if(postalCode!==undefined)vendor.postalCode=postalCode;
if(country!==undefined)vendor.country=country||null;
if(isInternational!==undefined)vendor.isInternational=isInternational;
if(description!==undefined)vendor.description=description;
if(isActive!==undefined)vendor.isActive=isActive;

const updated=await vendor.save();
const populated=await EquipmentVendor.findById(updated._id)
.populate({path:"state",model:State})
.populate({path:"country",model:Country});

return res.status(200).json(populated);
}catch(error){
return res.status(500).json({message:error.message});
}
};

export const deleteEquipmentVendor=async(req,res)=>{
try{
const {id}=req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid vendor id"});
}

const vendor=await EquipmentVendor.findByIdAndDelete(id);
if(!vendor){
return res.status(404).json({message:"Vendor not found"});
}

return res.status(200).json({message:"Vendor deleted successfully"});
}catch(error){
return res.status(500).json({message:error.message});
}
};