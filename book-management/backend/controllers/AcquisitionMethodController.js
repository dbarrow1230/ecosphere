// backend/controllers/AcquisitionMethodController.js
import AcquisitionMethodModel from "../models/AcquisitionMethodModel.js";

export const createAcquisitionMethod=async(req,res)=>{
 try{
  const payload={
   name:(req.body?.name||"").toString().trim(),
   notes:(req.body?.notes||"").toString().trim()
  };

  if(!payload.name){
   return res.status(400).json({success:false,message:"Acquisition method name is required"});
  }

  const method=await AcquisitionMethodModel.create(payload);

  return res.status(201).json({
   success:true,
   message:"Acquisition method created successfully",
   acquisitionMethod:method
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({
    success:false,
    message:"Acquisition method already exists",
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
   message:error.message||"Failed to create acquisition method",
   error:error.message
  });
 }
};

export const getAcquisitionMethods=async(req,res)=>{
 try{
  const {search="",page=1,limit,sort="name",order="asc"}=req.query;

  const query={};

  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const currentPage=Math.max(parseInt(page)||1,1);
  const perPage=limit?Math.max(parseInt(limit)||1,1):0;
  const skip=perPage?(currentPage-1)*perPage:0;
  const sortOrder=order==="desc"?-1:1;

  const findQuery=AcquisitionMethodModel.find(query).sort({[sort]:sortOrder});

  if(perPage){
   findQuery.skip(skip).limit(perPage);
  }

  const [acquisitionMethods,total]=await Promise.all([
   findQuery,
   AcquisitionMethodModel.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   total,
   page:currentPage,
   pages:perPage?Math.ceil(total/perPage):1,
   limit:perPage||total,
   acquisitionMethods
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch acquisition methods",
   error:error.message
  });
 }
};

export const getAcquisitionMethodById=async(req,res)=>{
 try{
  const method=await AcquisitionMethodModel.findById(req.params.id);

  if(!method){
   return res.status(404).json({success:false,message:"Acquisition method not found"});
  }

  return res.status(200).json({success:true,acquisitionMethod:method});
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch acquisition method",
   error:error.message
  });
 }
};

export const updateAcquisitionMethod=async(req,res)=>{
 try{
  const payload={
   name:(req.body?.name||"").toString().trim(),
   notes:(req.body?.notes||"").toString().trim()
  };

  if(!payload.name){
   return res.status(400).json({success:false,message:"Acquisition method name is required"});
  }

  const method=await AcquisitionMethodModel.findByIdAndUpdate(
   req.params.id,
   payload,
   {new:true,runValidators:true}
  );

  if(!method){
   return res.status(404).json({success:false,message:"Acquisition method not found"});
  }

  return res.status(200).json({
   success:true,
   message:"Acquisition method updated successfully",
   acquisitionMethod:method
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({
    success:false,
    message:"Acquisition method already exists",
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
   message:error.message||"Failed to update acquisition method",
   error:error.message
  });
 }
};

export const deleteAcquisitionMethod=async(req,res)=>{
 try{
  const method=await AcquisitionMethodModel.findByIdAndDelete(req.params.id);

  if(!method){
   return res.status(404).json({success:false,message:"Acquisition method not found"});
  }

  return res.status(200).json({
   success:true,
   message:"Acquisition method deleted successfully"
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to delete acquisition method",
   error:error.message
  });
 }
};