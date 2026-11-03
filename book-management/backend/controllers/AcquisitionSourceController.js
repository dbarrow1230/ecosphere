// backend/controllers/AcquisitionSourceController.js
import AcquisitionSourceModel from "../models/AcquisitionSourceModel.js";

export const createAcquisitionSource=async(req,res)=>{
 try{
  const payload={
   name:(req.body?.name||"").toString().trim(),
   website:(req.body?.website||"").toString().trim(),
   notes:(req.body?.notes||"").toString().trim()
  };

  if(!payload.name){
   return res.status(400).json({success:false,message:"Acquisition source name is required"});
  }

  const source=await AcquisitionSourceModel.create(payload);

  return res.status(201).json({
   success:true,
   message:"Acquisition source created successfully",
   acquisitionSource:source
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({
    success:false,
    message:"Acquisition source already exists",
    error:error.message
   });
  }

  if(error.name==="ValidationError"){
   const firstError=Object.values(error.errors||{})[0];
   return res.status(400).json({
    success:false,
    message:firstError?.message||"Validation failed",
    error:error.message
   });
  }

  return res.status(500).json({
   success:false,
   message:error.message||"Failed to create acquisition source",
   error:error.message
  });
 }
};

export const getAcquisitionSources=async(req,res)=>{
 try{
  const {search="",page=1,limit,sort="name",order="asc"}=req.query;

  const query={};

  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {website:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const currentPage=Math.max(parseInt(page)||1,1);
  const perPage=limit?Math.max(parseInt(limit)||1,1):0;
  const skip=perPage?(currentPage-1)*perPage:0;
  const sortOrder=order==="desc"?-1:1;

  const findQuery=AcquisitionSourceModel.find(query).sort({[sort]:sortOrder});

  if(perPage){
   findQuery.skip(skip).limit(perPage);
  }

  const [acquisitionSources,total]=await Promise.all([
   findQuery,
   AcquisitionSourceModel.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   total,
   page:currentPage,
   pages:perPage?Math.ceil(total/perPage):1,
   limit:perPage||total,
   acquisitionSources
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch acquisition sources",
   error:error.message
  });
 }
};

export const getAcquisitionSourceById=async(req,res)=>{
 try{
  const source=await AcquisitionSourceModel.findById(req.params.id);

  if(!source){
   return res.status(404).json({success:false,message:"Acquisition source not found"});
  }

  return res.status(200).json({success:true,acquisitionSource:source});
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch acquisition source",
   error:error.message
  });
 }
};

export const updateAcquisitionSource=async(req,res)=>{
 try{
  const payload={
   name:(req.body?.name||"").toString().trim(),
   website:(req.body?.website||"").toString().trim(),
   notes:(req.body?.notes||"").toString().trim()
  };

  if(!payload.name){
   return res.status(400).json({success:false,message:"Acquisition source name is required"});
  }

  const source=await AcquisitionSourceModel.findByIdAndUpdate(
   req.params.id,
   payload,
   {new:true,runValidators:true}
  );

  if(!source){
   return res.status(404).json({success:false,message:"Acquisition source not found"});
  }

  return res.status(200).json({
   success:true,
   message:"Acquisition source updated successfully",
   acquisitionSource:source
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({
    success:false,
    message:"Acquisition source already exists",
    error:error.message
   });
  }

  if(error.name==="ValidationError"){
   const firstError=Object.values(error.errors||{})[0];
   return res.status(400).json({
    success:false,
    message:firstError?.message||"Validation failed",
    error:error.message
   });
  }

  return res.status(500).json({
   success:false,
   message:error.message||"Failed to update acquisition source",
   error:error.message
  });
 }
};

export const deleteAcquisitionSource=async(req,res)=>{
 try{
  const source=await AcquisitionSourceModel.findByIdAndDelete(req.params.id);

  if(!source){
   return res.status(404).json({success:false,message:"Acquisition source not found"});
  }

  return res.status(200).json({
   success:true,
   message:"Acquisition source deleted successfully"
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to delete acquisition source",
   error:error.message
  });
 }
};