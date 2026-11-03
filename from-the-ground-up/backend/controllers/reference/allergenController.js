// backend/controllers/reference/allergenController.js
import Allergen from "../../models/reference/AllergenModel.js";

export const getAllergens=async(req,res)=>{
 try{
  const allergens=await Allergen.find({isActive:true}).sort({name:1});

  res.status(200).json({
   success:true,
   data:allergens
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get allergens",
   error:error.message
  });
 }
};

export const getAllergenById=async(req,res)=>{
 try{
  const {id}=req.params;

  const allergen=await Allergen.findById(id);

  if(!allergen){
   return res.status(404).json({
    success:false,
    message:"Allergen not found"
   });
  }

  res.status(200).json({
   success:true,
   data:allergen
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get allergen",
   error:error.message
  });
 }
};

export const createAllergen=async(req,res)=>{
 try{
  const {name,code,emoji,description,severityLevel,isMajor,isActive}=req.body;

  if(!name||!code){
   return res.status(400).json({
    success:false,
    message:"Name and code are required"
   });
  }

  const allergen=await Allergen.create({
   name,
   code,
   emoji,
   description,
   severityLevel,
   isMajor,
   isActive
  });

  res.status(201).json({
   success:true,
   data:allergen
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to create allergen",
   error:error.message
  });
 }
};

export const updateAllergen=async(req,res)=>{
 try{
  const {id}=req.params;
  const {name,code,emoji,description,severityLevel,isMajor,isActive}=req.body;

  const allergen=await Allergen.findByIdAndUpdate(
   id,
   {
    name,
    code,
    emoji,
    description,
    severityLevel,
    isMajor,
    isActive
   },
   {
    new:true,
    runValidators:true
   }
  );

  if(!allergen){
   return res.status(404).json({
    success:false,
    message:"Allergen not found"
   });
  }

  res.status(200).json({
   success:true,
   data:allergen
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to update allergen",
   error:error.message
  });
 }
};

export const deleteAllergen=async(req,res)=>{
 try{
  const {id}=req.params;

  const allergen=await Allergen.findByIdAndUpdate(
   id,
   {isActive:false},
   {new:true}
  );

  if(!allergen){
   return res.status(404).json({
    success:false,
    message:"Allergen not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Allergen deleted",
   data:allergen
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to delete allergen",
   error:error.message
  });
 }
};