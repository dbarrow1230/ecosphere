import Allergen from "../../models/reference/allergenModel.js";

const normalizeAllergenPayload=payload=>({
 name:String(payload.name||"").trim(),
 code:String(payload.code||"").trim().toUpperCase(),
 emoji:String(payload.emoji||"").trim(),
 severityLevel:payload.severityLevel||"High",
 isMajor:payload.isMajor!==undefined?!!payload.isMajor:false,
 isActive:payload.isActive!==undefined?!!payload.isActive:true,
 notes:String(payload.notes||"").trim()
});

export const createAllergen=async(req,res,next)=>{
 try{
  const allergen=await Allergen.create(normalizeAllergenPayload(req.body));
  res.status(201).json({success:true,data:allergen});
 }catch(error){
  next(error);
 }
};

export const getAllergens=async(req,res,next)=>{
 try{
  const filter={};

  if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";
  if(req.query.isMajor!==undefined)filter.isMajor=req.query.isMajor==="true";

  const allergens=await Allergen.find(filter).sort({isMajor:-1,name:1});
  res.status(200).json({success:true,data:allergens});
 }catch(error){
  next(error);
 }
};

export const getAllergenById=async(req,res,next)=>{
 try{
  const allergen=await Allergen.findById(req.params.id);

  if(!allergen)return res.status(404).json({success:false,message:"Allergen not found"});

  res.status(200).json({success:true,data:allergen});
 }catch(error){
  next(error);
 }
};

export const updateAllergen=async(req,res,next)=>{
 try{
  const allergen=await Allergen.findByIdAndUpdate(
   req.params.id,
   normalizeAllergenPayload(req.body),
   {returnDocument:"after",runValidators:true}
  );

  if(!allergen)return res.status(404).json({success:false,message:"Allergen not found"});

  res.status(200).json({success:true,data:allergen});
 }catch(error){
  next(error);
 }
};

export const deleteAllergen=async(req,res,next)=>{
 try{
  const allergen=await Allergen.findByIdAndDelete(req.params.id);

  if(!allergen)return res.status(404).json({success:false,message:"Allergen not found"});

  res.status(200).json({success:true,message:"Allergen deleted successfully"});
 }catch(error){
  next(error);
 }
};
