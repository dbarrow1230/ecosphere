// backend/controllers/vendors/vendorController.js
import Vendor from "../../models/vendors/VendorModel.js";
import State from "../../models/locations/StateModel.js";
import Country from "../../models/locations/CountryModel.js";

export const createVendor=async(req,res)=>{
 try{
  const {
   name,legalName,email,phone,website,address1,address2,city,state,postalCode,country,
   isActive,isPreferred,notes
  }=req.body;

  if(!name||!name.trim()) return res.status(400).json({message:"Name is required"});

  const vendor=await Vendor.create({
   name:name.trim(),
   legalName:legalName?.trim()||"",
   email:email?.trim()||"",
   phone:phone?.trim()||"",
   website:website?.trim()||"",
   address1:address1?.trim()||"",
   address2:address2?.trim()||"",
   city:city?.trim()||"",
   state:state||null,
   postalCode:postalCode?.trim()||"",
   country:country||null,
   isActive:typeof isActive==="boolean"?isActive:true,
   isPreferred:typeof isPreferred==="boolean"?isPreferred:false,
   notes:notes?.trim()||""
  });

  const populatedVendor=await Vendor.findById(vendor._id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});

  return res.status(201).json(populatedVendor);
 }catch(error){
  return res.status(500).json({message:"Failed to create vendor",error:error.message});
 }
};

export const getVendors=async(req,res)=>{
 try{
  const {search,isActive,isPreferred,state,country}=req.query;

  const filter={};

  if(search?.trim()){
   filter.$or=[
    {name:{$regex:search.trim(),$options:"i"}},
    {legalName:{$regex:search.trim(),$options:"i"}},
    {email:{$regex:search.trim(),$options:"i"}},
    {phone:{$regex:search.trim(),$options:"i"}},
    {website:{$regex:search.trim(),$options:"i"}},
    {address1:{$regex:search.trim(),$options:"i"}},
    {address2:{$regex:search.trim(),$options:"i"}},
    {city:{$regex:search.trim(),$options:"i"}},
    {postalCode:{$regex:search.trim(),$options:"i"}},
    {notes:{$regex:search.trim(),$options:"i"}}
   ];
  }

  if(isActive==="true") filter.isActive=true;
  if(isActive==="false") filter.isActive=false;

  if(isPreferred==="true") filter.isPreferred=true;
  if(isPreferred==="false") filter.isPreferred=false;

  if(state) filter.state=state;
  if(country) filter.country=country;

  const vendors=await Vendor.find(filter)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country})
   .sort({name:1});

  return res.status(200).json(vendors);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendors",error:error.message});
 }
};

export const getVendorById=async(req,res)=>{
 try{
  const vendor=await Vendor.findById(req.params.id)
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});

  if(!vendor) return res.status(404).json({message:"Vendor not found"});

  return res.status(200).json(vendor);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor",error:error.message});
 }
};

export const updateVendor=async(req,res)=>{
 try{
  const {
   name,legalName,email,phone,website,address1,address2,city,state,postalCode,country,
   isActive,isPreferred,notes
  }=req.body;

  const updateData={};

  if(name!==undefined){
   if(!name.trim()) return res.status(400).json({message:"Name is required"});
   updateData.name=name.trim();
  }

  if(legalName!==undefined) updateData.legalName=legalName?.trim()||"";
  if(email!==undefined) updateData.email=email?.trim()||"";
  if(phone!==undefined) updateData.phone=phone?.trim()||"";
  if(website!==undefined) updateData.website=website?.trim()||"";
  if(address1!==undefined) updateData.address1=address1?.trim()||"";
  if(address2!==undefined) updateData.address2=address2?.trim()||"";
  if(city!==undefined) updateData.city=city?.trim()||"";
  if(state!==undefined) updateData.state=state||null;
  if(postalCode!==undefined) updateData.postalCode=postalCode?.trim()||"";
  if(country!==undefined) updateData.country=country||null;
  if(isActive!==undefined) updateData.isActive=isActive;
  if(isPreferred!==undefined) updateData.isPreferred=isPreferred;
  if(notes!==undefined) updateData.notes=notes?.trim()||"";

  const vendor=await Vendor.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate({path:"state",model:State})
   .populate({path:"country",model:Country});

  if(!vendor) return res.status(404).json({message:"Vendor not found"});

  return res.status(200).json(vendor);
 }catch(error){
  return res.status(500).json({message:"Failed to update vendor",error:error.message});
 }
};

export const deleteVendor=async(req,res)=>{
 try{
  const vendor=await Vendor.findByIdAndDelete(req.params.id);

  if(!vendor) return res.status(404).json({message:"Vendor not found"});

  return res.status(200).json({message:"Vendor deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete vendor",error:error.message});
 }
};