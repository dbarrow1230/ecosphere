import Equipment from "../../models/reference/equipmentModel.js";

export const getEquipment=async(req,res)=>{
 try{
  const filter={};
  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";
  const equipment=await Equipment.find(filter).sort({name:1});
  return res.json(equipment);
 }catch(error){return res.status(500).json({message:"Failed to fetch equipment",error:error.message});}
};

export const createEquipment=async(req,res)=>{
 try{
  const equipment=await Equipment.create(req.body);
  return res.status(201).json({message:"Equipment created successfully",equipment});
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"Equipment already exists"});
  return res.status(500).json({message:"Failed to create equipment",error:error.message});
 }
};

export const updateEquipment=async(req,res)=>{
 try{
  const equipment=await Equipment.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!equipment)return res.status(404).json({message:"Equipment not found"});
  return res.json({message:"Equipment updated successfully",equipment});
 }catch(error){return res.status(500).json({message:"Failed to update equipment",error:error.message});}
};

export const deleteEquipment=async(req,res)=>{
 try{
  const equipment=await Equipment.findByIdAndDelete(req.params.id);
  if(!equipment)return res.status(404).json({message:"Equipment not found"});
  return res.json({message:"Equipment deleted successfully"});
 }catch(error){return res.status(500).json({message:"Failed to delete equipment",error:error.message});}
};
