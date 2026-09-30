// controllers/boroughController.js
import Borough from "../models/boroughModel.js";

const getBoroughs=async(req,res)=>{
 try{
  const filter={};
  if(req.query.active==="true")filter.active=true;
  if(req.query.active==="false")filter.active=false;
  if(req.query.slug)filter.slug=req.query.slug;
  if(req.query.code)filter.code=req.query.code.toUpperCase();

  const boroughs=await Borough.find(filter).sort({name:1});
  res.status(200).json(boroughs);
 }catch(err){
  res.status(500).json({message:err.message||"Unable to load boroughs."});
 }
};

const getBoroughById=async(req,res)=>{
 try{
  const borough=await Borough.findById(req.params.id);
  if(!borough)return res.status(404).json({message:"Borough not found."});
  res.status(200).json(borough);
 }catch(err){
  res.status(500).json({message:err.message||"Unable to load borough."});
 }
};

const createBorough=async(req,res)=>{
 try{
  const borough=await Borough.create({
   name:req.body.name,
   slug:req.body.slug,
   code:req.body.code,
   active:req.body.active??true
  });
  res.status(201).json(borough);
 }catch(err){
  res.status(500).json({message:err.message||"Unable to create borough."});
 }
};

const updateBorough=async(req,res)=>{
 try{
  const borough=await Borough.findById(req.params.id);
  if(!borough)return res.status(404).json({message:"Borough not found."});

  borough.name=req.body.name??borough.name;
  borough.slug=req.body.slug??borough.slug;
  borough.code=req.body.code??borough.code;
  borough.active=req.body.active??borough.active;

  const updatedBorough=await borough.save();
  res.status(200).json(updatedBorough);
 }catch(err){
  res.status(500).json({message:err.message||"Unable to update borough."});
 }
};

const deleteBorough=async(req,res)=>{
 try{
  const borough=await Borough.findById(req.params.id);
  if(!borough)return res.status(404).json({message:"Borough not found."});
  await borough.deleteOne();
  res.status(200).json({message:"Borough removed."});
 }catch(err){
  res.status(500).json({message:err.message||"Unable to delete borough."});
 }
};

export {getBoroughs,getBoroughById,createBorough,updateBorough,deleteBorough};