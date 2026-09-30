// backend/controllers/ingredients/ingredientController.js
import Ingredient from "../../models/ingredients/IngredientModel.js";

export const createIngredient=async(req,res)=>{
 try{
  const {name,description,sku,unit,category,vendorItems,isActive,notes}=req.body;

  if(!name||!name.trim()) return res.status(400).json({message:"Name is required"});
  if(!unit||!unit.trim()) return res.status(400).json({message:"Unit is required"});

  const ingredient=await Ingredient.create({
   name:name.trim(),
   description:description?.trim()||"",
   sku:sku?.trim()||"",
   unit:unit.trim(),
   category:category?.trim()||"",
   vendorItems:Array.isArray(vendorItems)?vendorItems:[],
   isActive:typeof isActive==="boolean"?isActive:true,
   notes:notes?.trim()||""
  });

  return res.status(201).json(ingredient);
 }catch(error){
  return res.status(500).json({message:"Failed to create ingredient",error:error.message});
 }
};

export const getIngredients=async(req,res)=>{
 try{
  const {search,category,isActive}=req.query;

  const filter={};

  if(search?.trim()){
   filter.$or=[
    {name:{$regex:search.trim(),$options:"i"}},
    {description:{$regex:search.trim(),$options:"i"}},
    {sku:{$regex:search.trim(),$options:"i"}},
    {category:{$regex:search.trim(),$options:"i"}},
    {notes:{$regex:search.trim(),$options:"i"}}
   ];
  }

  if(category?.trim()) filter.category=category.trim();
  if(isActive==="true") filter.isActive=true;
  if(isActive==="false") filter.isActive=false;

  const ingredients=await Ingredient.find(filter).populate("vendorItems").sort({name:1});

  return res.status(200).json(ingredients);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch ingredients",error:error.message});
 }
};

export const getIngredientById=async(req,res)=>{
 try{
  const ingredient=await Ingredient.findById(req.params.id).populate("vendorItems");

  if(!ingredient) return res.status(404).json({message:"Ingredient not found"});

  return res.status(200).json(ingredient);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch ingredient",error:error.message});
 }
};

export const updateIngredient=async(req,res)=>{
 try{
  const {name,description,sku,unit,category,vendorItems,isActive,notes}=req.body;

  const updateData={};

  if(name!==undefined){
   if(!name.trim()) return res.status(400).json({message:"Name is required"});
   updateData.name=name.trim();
  }

  if(unit!==undefined){
   if(!unit.trim()) return res.status(400).json({message:"Unit is required"});
   updateData.unit=unit.trim();
  }

  if(description!==undefined) updateData.description=description?.trim()||"";
  if(sku!==undefined) updateData.sku=sku?.trim()||"";
  if(category!==undefined) updateData.category=category?.trim()||"";
  if(vendorItems!==undefined) updateData.vendorItems=Array.isArray(vendorItems)?vendorItems:[];
  if(isActive!==undefined) updateData.isActive=isActive;
  if(notes!==undefined) updateData.notes=notes?.trim()||"";

  const ingredient=await Ingredient.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  ).populate("vendorItems");

  if(!ingredient) return res.status(404).json({message:"Ingredient not found"});

  return res.status(200).json(ingredient);
 }catch(error){
  return res.status(500).json({message:"Failed to update ingredient",error:error.message});
 }
};

export const deleteIngredient=async(req,res)=>{
 try{
  const ingredient=await Ingredient.findByIdAndDelete(req.params.id);

  if(!ingredient) return res.status(404).json({message:"Ingredient not found"});

  return res.status(200).json({message:"Ingredient deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete ingredient",error:error.message});
 }
};