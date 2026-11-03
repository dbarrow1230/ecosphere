// backend/controllers/preservation/dehydratorController.js
import Dehydrator from "../../models/preservation/dehydration/dehydratorModel.js";

const toJson=d=>({
 ...d.toObject(),
 watts:d.watts==null?null:Number(d.watts.toString())
});

export const createDehydrator=async(req,res)=>{
 try{
  const dehydrator=await Dehydrator.create({
   brand:req.body.brand,
   name:req.body.name,
   watts:req.body.watts,
   isActive:req.body.isActive,
   notes:req.body.notes
  });
  return res.status(201).json(toJson(dehydrator));
 }catch(err){
  return res.status(400).json({message:"Failed to create dehydrator",error:err.message});
 }
};

export const getDehydrators=async(req,res)=>{
 try{
  const dehydrators=await Dehydrator.find({}).sort({brand:1,name:1,createdAt:-1});
  return res.json(dehydrators.map(toJson));
 }catch(err){
  return res.status(500).json({message:"Failed to fetch dehydrators",error:err.message});
 }
};

export const getDehydratorById=async(req,res)=>{
 try{
  const dehydrator=await Dehydrator.findById(req.params.id);
  if(!dehydrator)return res.status(404).json({message:"Dehydrator not found"});
  return res.json(toJson(dehydrator));
 }catch(err){
  return res.status(500).json({message:"Failed to fetch dehydrator",error:err.message});
 }
};

export const updateDehydrator=async(req,res)=>{
 try{
  const dehydrator=await Dehydrator.findByIdAndUpdate(
   req.params.id,
   {
    brand:req.body.brand,
    name:req.body.name,
    watts:req.body.watts,
    isActive:req.body.isActive,
    notes:req.body.notes
   },
   {returnDocument:"after",runValidators:true}
  );
  if(!dehydrator)return res.status(404).json({message:"Dehydrator not found"});
  return res.json(toJson(dehydrator));
 }catch(err){
  return res.status(400).json({message:"Failed to update dehydrator",error:err.message});
 }
};

export const deleteDehydrator=async(req,res)=>{
 try{
  const dehydrator=await Dehydrator.findByIdAndDelete(req.params.id);
  if(!dehydrator)return res.status(404).json({message:"Dehydrator not found"});
  return res.json({message:"Dehydrator deleted successfully"});
 }catch(err){
  return res.status(500).json({message:"Failed to delete dehydrator",error:err.message});
 }
};

export const toggleDehydratorStatus=async(req,res)=>{
 try{
  const dehydrator=await Dehydrator.findById(req.params.id);
  if(!dehydrator)return res.status(404).json({message:"Dehydrator not found"});
  dehydrator.isActive=!dehydrator.isActive;
  await dehydrator.save();
  return res.json(toJson(dehydrator));
 }catch(err){
  return res.status(400).json({message:"Failed to toggle dehydrator status",error:err.message});
 }
};

const dehydratorController={
 createDehydrator,
 getDehydrators,
 getDehydratorById,
 updateDehydrator,
 deleteDehydrator,
 toggleDehydratorStatus
};

export default dehydratorController;
