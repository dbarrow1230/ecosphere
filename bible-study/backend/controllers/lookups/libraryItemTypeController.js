// backend/controllers/lookups/libraryItemTypeController.js
import LibraryItemType from "../../models/lookups/libraryItemTypeModel.js";

export const getLibraryItemTypes=async(req,res)=>{
 try{
  const {active}=req.query;
  const filter={};

  if(active==="true")filter.active=true;
  if(active==="false")filter.active=false;

  const types=await LibraryItemType.find(filter).sort({sortOrder:1,title:1});

  return res.status(200).json({
   success:true,
   count:types.length,
   data:types
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch library item types",
   error:err.message
  });
 }
};

export const getLibraryItemTypeById=async(req,res)=>{
 try{
  const type=await LibraryItemType.findById(req.params.id);

  if(!type){
   return res.status(404).json({
    success:false,
    message:"Library item type not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:type
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch library item type",
   error:err.message
  });
 }
};

export const createLibraryItemType=async(req,res)=>{
 try{
  const type=await LibraryItemType.create(req.body);

  return res.status(201).json({
   success:true,
   message:"Library item type created successfully",
   data:type
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create library item type",
   error:err.message
  });
 }
};

export const updateLibraryItemType=async(req,res)=>{
 try{
  const type=await LibraryItemType.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  });

  if(!type){
   return res.status(404).json({
    success:false,
    message:"Library item type not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Library item type updated successfully",
   data:type
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update library item type",
   error:err.message
  });
 }
};

export const deleteLibraryItemType=async(req,res)=>{
 try{
  const type=await LibraryItemType.findByIdAndDelete(req.params.id);

  if(!type){
   return res.status(404).json({
    success:false,
    message:"Library item type not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Library item type deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete library item type",
   error:err.message
  });
 }
};