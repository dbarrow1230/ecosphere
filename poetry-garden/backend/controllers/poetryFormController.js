// backend/controllers/poetryFormController.js
import PoetryForm from "../models/PoetryForm.js";

const slugify=value=>String(value||"")
 .toLowerCase()
 .trim()
 .replace(/[^a-z0-9]+/g,"-")
 .replace(/^-+|-+$/g,"");

export const getPoetryForms=async(req,res)=>{
 try{
  const filter={};

  if(req.query.type){
   filter.type=req.query.type;
  }

  if(req.query.category){
   filter.category=req.query.category;
  }

  if(req.query.isActive!==undefined){
   filter.isActive=req.query.isActive==="true";
  }

  if(req.query.search?.trim()){
   const search=req.query.search.trim();

   filter.$or=[
    {name:{$regex:search,$options:"i"}},
    {slug:{$regex:search,$options:"i"}},
    {alternateNames:{$regex:search,$options:"i"}},
    {category:{$regex:search,$options:"i"}},
    {origin:{$regex:search,$options:"i"}},
    {description:{$regex:search,$options:"i"}},
    {tags:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}},
    {"structure.stanzas":{$regex:search,$options:"i"}},
    {"structure.meter":{$regex:search,$options:"i"}},
    {"structure.rhymeScheme":{$regex:search,$options:"i"}},
    {"structure.syllablePattern":{$regex:search,$options:"i"}},
    {"structure.refrain":{$regex:search,$options:"i"}},
    {"structure.additionalRules":{$regex:search,$options:"i"}},
    {"examples.title":{$regex:search,$options:"i"}},
    {"examples.author":{$regex:search,$options:"i"}},
    {"examples.text":{$regex:search,$options:"i"}},
    {"examples.notes":{$regex:search,$options:"i"}},
    {"references.title":{$regex:search,$options:"i"}}
   ];
  }

  const poetryForms=await PoetryForm.find(filter).sort({name:1});

  res.json(poetryForms);
 }catch(error){
  res.status(500).json({
   message:error.message
  });
 }
};

export const getPoetryForm=async(req,res)=>{
 try{
  const poetryForm=await PoetryForm.findById(req.params.id);

  if(!poetryForm){
   return res.status(404).json({
    message:"Poetry form not found"
   });
  }

  res.json(poetryForm);
 }catch(error){
  res.status(500).json({
   message:error.message
  });
 }
};

export const createPoetryForm=async(req,res)=>{
 try{
  const payload={
   ...req.body
  };

  payload.slug=slugify(
   payload.slug||
   payload.name
  );

  const poetryForm=new PoetryForm(payload);

  await poetryForm.save();

  res.status(201).json(poetryForm);
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"name";

   return res.status(409).json({
    message:`A poetry form with this ${field} already exists`
   });
  }

  res.status(400).json({
   message:error.message
  });
 }
};

export const updatePoetryForm=async(req,res)=>{
 try{
  const poetryForm=await PoetryForm.findById(req.params.id);

  if(!poetryForm){
   return res.status(404).json({
    message:"Poetry form not found"
   });
  }

  const payload={
   ...req.body
  };

  if(payload.name){
   payload.slug=slugify(
    payload.slug||
    payload.name
   );
  }else if(payload.slug){
   payload.slug=slugify(payload.slug);
  }

  Object.assign(
   poetryForm,
   payload
  );

  await poetryForm.save();

  res.json(poetryForm);
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"name";

   return res.status(409).json({
    message:`A poetry form with this ${field} already exists`
   });
  }

  res.status(400).json({
   message:error.message
  });
 }
};

export const deletePoetryForm=async(req,res)=>{
 try{
  const poetryForm=await PoetryForm.findByIdAndDelete(req.params.id);

  if(!poetryForm){
   return res.status(404).json({
    message:"Poetry form not found"
   });
  }

  res.json({
   message:"Poetry form deleted",
   id:poetryForm._id
  });
 }catch(error){
  res.status(500).json({
   message:error.message
  });
 }
};