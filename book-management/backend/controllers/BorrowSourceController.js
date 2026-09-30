// backend/controllers/BorrowSourceController.js
import BorrowSourceModel from "../models/BorrowSourceModel.js";

const BORROW_SOURCE_TYPES=["Library","Person","School","Archive","Subscription","Other"];

const normalizeEnumValue=(value,allowedValues,defaultValue)=>{
 const input=(value||defaultValue).toString().trim();
 return allowedValues.find(item=>item.toLowerCase()===input.toLowerCase())||defaultValue;
};

export const createBorrowSource=async(req,res)=>{
 try{
  const payload={
   name:(req.body?.name||"").toString().trim(),
   type:normalizeEnumValue(req.body?.type,BORROW_SOURCE_TYPES,"Other"),
   website:(req.body?.website||"").toString().trim(),
   notes:(req.body?.notes||"").toString().trim()
  };

  if(!payload.name){
   return res.status(400).json({success:false,message:"Borrow source name is required"});
  }

  const borrowSource=await BorrowSourceModel.create(payload);

  return res.status(201).json({
   success:true,
   message:"Borrow source created successfully",
   borrowSource
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({
    success:false,
    message:"Borrow source already exists",
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
   message:error.message||"Failed to create borrow source",
   error:error.message
  });
 }
};

export const getBorrowSources=async(req,res)=>{
 try{
  const {search="",type="",page=1,limit,sort="name",order="asc"}=req.query;

  const query={};

  if(type){
   query.type=normalizeEnumValue(type,BORROW_SOURCE_TYPES,"Other");
  }

  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {type:{$regex:search,$options:"i"}},
    {website:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const currentPage=Math.max(parseInt(page)||1,1);
  const perPage=limit?Math.max(parseInt(limit)||1,1):0;
  const skip=perPage?(currentPage-1)*perPage:0;
  const sortOrder=order==="desc"?-1:1;

  const findQuery=BorrowSourceModel.find(query).sort({[sort]:sortOrder});

  if(perPage){
   findQuery.skip(skip).limit(perPage);
  }

  const [borrowSources,total]=await Promise.all([
   findQuery,
   BorrowSourceModel.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   total,
   page:currentPage,
   pages:perPage?Math.ceil(total/perPage):1,
   limit:perPage||total,
   borrowSources
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch borrow sources",
   error:error.message
  });
 }
};

export const getBorrowSourceById=async(req,res)=>{
 try{
  const borrowSource=await BorrowSourceModel.findById(req.params.id);

  if(!borrowSource){
   return res.status(404).json({success:false,message:"Borrow source not found"});
  }

  return res.status(200).json({success:true,borrowSource});
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch borrow source",
   error:error.message
  });
 }
};

export const updateBorrowSource=async(req,res)=>{
 try{
  const payload={
   name:(req.body?.name||"").toString().trim(),
   type:normalizeEnumValue(req.body?.type,BORROW_SOURCE_TYPES,"Other"),
   website:(req.body?.website||"").toString().trim(),
   notes:(req.body?.notes||"").toString().trim()
  };

  if(!payload.name){
   return res.status(400).json({success:false,message:"Borrow source name is required"});
  }

  const borrowSource=await BorrowSourceModel.findByIdAndUpdate(
   req.params.id,
   payload,
   {new:true,runValidators:true}
  );

  if(!borrowSource){
   return res.status(404).json({success:false,message:"Borrow source not found"});
  }

  return res.status(200).json({
   success:true,
   message:"Borrow source updated successfully",
   borrowSource
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({
    success:false,
    message:"Borrow source already exists",
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
   message:error.message||"Failed to update borrow source",
   error:error.message
  });
 }
};

export const deleteBorrowSource=async(req,res)=>{
 try{
  const borrowSource=await BorrowSourceModel.findByIdAndDelete(req.params.id);

  if(!borrowSource){
   return res.status(404).json({success:false,message:"Borrow source not found"});
  }

  return res.status(200).json({
   success:true,
   message:"Borrow source deleted successfully"
  });
 }catch(error){
  return res.status(500).json({
   success:false,
   message:"Failed to delete borrow source",
   error:error.message
  });
 }
};