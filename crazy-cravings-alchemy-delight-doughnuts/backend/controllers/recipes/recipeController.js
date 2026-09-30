// backend/controllers/recipes/recipeController.js
import Recipe from "../../models/recipes/RecipeModel.js";

export const createRecipe=async(req,res)=>{
 try{
  const {name,description,yieldQty,yieldUnit,prepTime,cookTime,ingredients,steps,notes,isActive}=req.body;

  if(!name||!name.trim()) return res.status(400).json({message:"Name is required"});
  if(yieldQty===undefined||yieldQty<0) return res.status(400).json({message:"Yield quantity is required"});
  if(!yieldUnit||!yieldUnit.trim()) return res.status(400).json({message:"Yield unit is required"});

  const recipe=await Recipe.create({
   name:name.trim(),
   description:description?.trim()||"",
   yieldQty,
   yieldUnit:yieldUnit.trim(),
   prepTime:prepTime||0,
   cookTime:cookTime||0,
   ingredients:Array.isArray(ingredients)?ingredients:[],
   steps:Array.isArray(steps)?steps:[],
   notes:notes?.trim()||"",
   isActive:typeof isActive==="boolean"?isActive:true
  });

  return res.status(201).json(recipe);
 }catch(error){
  return res.status(500).json({message:"Failed to create recipe",error:error.message});
 }
};

export const getRecipes=async(req,res)=>{
 try{
  const {search,isActive}=req.query;

  const filter={};

  if(search?.trim()){
   filter.$or=[
    {name:{$regex:search.trim(),$options:"i"}},
    {description:{$regex:search.trim(),$options:"i"}},
    {notes:{$regex:search.trim(),$options:"i"}}
   ];
  }

  if(isActive==="true") filter.isActive=true;
  if(isActive==="false") filter.isActive=false;

  const recipes=await Recipe.find(filter)
   .populate("ingredients.ingredient")
   .sort({name:1});

  return res.status(200).json(recipes);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch recipes",error:error.message});
 }
};

export const getRecipeById=async(req,res)=>{
 try{
  const recipe=await Recipe.findById(req.params.id)
   .populate("ingredients.ingredient");

  if(!recipe) return res.status(404).json({message:"Recipe not found"});

  return res.status(200).json(recipe);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch recipe",error:error.message});
 }
};

export const updateRecipe=async(req,res)=>{
 try{
  const {name,description,yieldQty,yieldUnit,prepTime,cookTime,ingredients,steps,notes,isActive}=req.body;

  const updateData={};

  if(name!==undefined){
   if(!name.trim()) return res.status(400).json({message:"Name is required"});
   updateData.name=name.trim();
  }

  if(yieldQty!==undefined){
   if(yieldQty<0) return res.status(400).json({message:"Yield quantity must be >= 0"});
   updateData.yieldQty=yieldQty;
  }

  if(yieldUnit!==undefined){
   if(!yieldUnit.trim()) return res.status(400).json({message:"Yield unit is required"});
   updateData.yieldUnit=yieldUnit.trim();
  }

  if(description!==undefined) updateData.description=description?.trim()||"";
  if(prepTime!==undefined) updateData.prepTime=prepTime||0;
  if(cookTime!==undefined) updateData.cookTime=cookTime||0;
  if(ingredients!==undefined) updateData.ingredients=Array.isArray(ingredients)?ingredients:[];
  if(steps!==undefined) updateData.steps=Array.isArray(steps)?steps:[];
  if(notes!==undefined) updateData.notes=notes?.trim()||"";
  if(isActive!==undefined) updateData.isActive=isActive;

  const recipe=await Recipe.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  ).populate("ingredients.ingredient");

  if(!recipe) return res.status(404).json({message:"Recipe not found"});

  return res.status(200).json(recipe);
 }catch(error){
  return res.status(500).json({message:"Failed to update recipe",error:error.message});
 }
};

export const deleteRecipe=async(req,res)=>{
 try{
  const recipe=await Recipe.findByIdAndDelete(req.params.id);

  if(!recipe) return res.status(404).json({message:"Recipe not found"});

  return res.status(200).json({message:"Recipe deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete recipe",error:error.message});
 }
};