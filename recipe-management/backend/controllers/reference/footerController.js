import Footer from "../../models/reference/footerModel.js";
import Business from "../../models/reference/businessModel.js";
import Season from "../../models/reference/seasonModel.js";

const populateFooter=query=>query
 .populate({path:"business_id",model:Business})
 .populate({path:"seasonRef",model:Season});

export const createFooter=async(req,res,next)=>{
 try{
  const footer=await Footer.create(req.body);
  const populatedFooter=await populateFooter(
   Footer.findById(footer._id)
  );
  res.status(201).json(populatedFooter);
 }catch(error){
  next(error);
 }
};

export const getFooters=async(req,res,next)=>{
 try{
  const filter={};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.seasonRef)filter.seasonRef=req.query.seasonRef;
  if(req.query.isDefault!==undefined)filter.isDefault=req.query.isDefault==="true";
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";

  const footers=await populateFooter(
   Footer.find(filter).sort({createdAt:-1})
  );

  res.status(200).json(footers);
 }catch(error){
  next(error);
 }
};

export const getFooterById=async(req,res,next)=>{
 try{
  const footer=await populateFooter(
   Footer.findById(req.params.id)
  );

  if(!footer)return res.status(404).json({message:"Footer not found"});

  res.status(200).json(footer);
 }catch(error){
  next(error);
 }
};

export const updateFooter=async(req,res,next)=>{
 try{
  const updated=await Footer.findByIdAndUpdate(
   req.params.id,
   req.body,
   {returnDocument:"after",runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Footer not found"});

  const populatedFooter=await populateFooter(
   Footer.findById(updated._id)
  );

  res.status(200).json(populatedFooter);
 }catch(error){
  next(error);
 }
};

export const deleteFooter=async(req,res,next)=>{
 try{
  const footer=await Footer.findByIdAndDelete(req.params.id);

  if(!footer)return res.status(404).json({message:"Footer not found"});

  res.status(200).json({message:"Footer deleted successfully"});
 }catch(error){
  next(error);
 }
};
