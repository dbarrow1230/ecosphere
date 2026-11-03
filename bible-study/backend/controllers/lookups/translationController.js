// backend/controllers/lookups/translationController.js
import Translation from "../../models/lookups/translationModel.js";

export const getTranslations=async(req,res)=>{
 try{
  const {active,language,type}=req.query;
  const filter={};

  if(active==="true")filter.active=true;
  if(active==="false")filter.active=false;
  if(language)filter.language=language;
  if(type)filter.type=type;

  const translations=await Translation.find(filter).sort({sortOrder:1,title:1});

  return res.status(200).json({
   success:true,
   count:translations.length,
   data:translations
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch translations",
   error:err.message
  });
 }
};

export const getTranslationById=async(req,res)=>{
 try{
  const translation=await Translation.findById(req.params.id);

  if(!translation){
   return res.status(404).json({
    success:false,
    message:"Translation not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:translation
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch translation",
   error:err.message
  });
 }
};

export const getNextTranslationSortOrder=async(req,res)=>{
 try{
  const lastTranslation=await Translation.findOne().sort({sortOrder:-1,_id:-1}).select("sortOrder");
  const nextSortOrder=(lastTranslation?.sortOrder??0)+1;

  return res.status(200).json({
   success:true,
   data:{sortOrder:nextSortOrder}
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch next translation sort order",
   error:err.message
  });
 }
};

export const createTranslation=async(req,res)=>{
 try{
  const payload={...req.body};

  if(payload.sortOrder===undefined||payload.sortOrder===null||payload.sortOrder===""){
   const lastTranslation=await Translation.findOne().sort({sortOrder:-1,_id:-1}).select("sortOrder");
   payload.sortOrder=(lastTranslation?.sortOrder??0)+1;
  }else{
   payload.sortOrder=Number(payload.sortOrder)||0;
  }

  const translation=await Translation.create(payload);

  return res.status(201).json({
   success:true,
   message:"Translation created successfully",
   data:translation
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create translation",
   error:err.message
  });
 }
};

export const updateTranslation=async(req,res)=>{
 try{
  const payload={...req.body};

  if(payload.sortOrder!==undefined&&payload.sortOrder!==null&&payload.sortOrder!==""){
   payload.sortOrder=Number(payload.sortOrder)||0;
  }

  const translation=await Translation.findByIdAndUpdate(req.params.id,payload,{
   returnDocument:"after",
   runValidators:true
  });

  if(!translation){
   return res.status(404).json({
    success:false,
    message:"Translation not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Translation updated successfully",
   data:translation
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update translation",
   error:err.message
  });
 }
};

export const deleteTranslation=async(req,res)=>{
 try{
  const translation=await Translation.findByIdAndDelete(req.params.id);

  if(!translation){
   return res.status(404).json({
    success:false,
    message:"Translation not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Translation deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete translation",
   error:err.message
  });
 }
};
