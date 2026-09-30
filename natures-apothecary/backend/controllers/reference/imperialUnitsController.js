// backend/controllers/reference/imperialUnitsController.js
import mongoose from "mongoose";
import ImperialUnit from "../../models/reference/imperialUnitsModel.js";

const formatImperialUnit=doc=>{
 const item=doc?.toObject?doc.toObject():doc;
 if(!item)return item;
 return{
  ...item,
  conversionFactor:item.conversionFactor!=null?item.conversionFactor.toString():"1"
 };
};

export const createImperialUnit=async(req,res)=>{
 try{
  const{name,singular,plural,symbol,code,unitType,baseUnit,conversionFactor,description,notes}=req.body;

  if(!name)return res.status(400).json({success:false,message:"Name is required"});
  if(!symbol)return res.status(400).json({success:false,message:"Symbol is required"});
  if(!unitType)return res.status(400).json({success:false,message:"Unit type is required"});

  const imperialUnit=new ImperialUnit({
   name:name.trim(),
   singular:singular||"",
   plural:plural||"",
   symbol:symbol.trim(),
   code:code||"",
   unitType:String(unitType).trim().toLowerCase(),
   baseUnit:Boolean(baseUnit),
   conversionFactor:conversionFactor!==undefined&&conversionFactor!==null&&conversionFactor!==""?mongoose.Types.Decimal128.fromString(String(conversionFactor)):mongoose.Types.Decimal128.fromString("1"),
   description:description||"",
   notes:Array.isArray(notes)?notes.filter(Boolean):[]
  });

  const saved=await imperialUnit.save();
  return res.status(201).json({success:true,message:"Imperial unit created successfully",imperialUnit:formatImperialUnit(saved)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error creating imperial unit",error:error.message});
 }
};

export const getImperialUnits=async(req,res)=>{
 try{
  const{search,unitType,baseUnit}=req.query;
  const query={};

  if(unitType)query.unitType=String(unitType).trim().toLowerCase();
  if(baseUnit!==undefined)query.baseUnit=String(baseUnit)==="true";

  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {singular:{$regex:search,$options:"i"}},
    {plural:{$regex:search,$options:"i"}},
    {symbol:{$regex:search,$options:"i"}},
    {code:{$regex:search,$options:"i"}},
    {description:{$regex:search,$options:"i"}}
   ];
  }

  const imperialUnits=await ImperialUnit.find(query).sort({unitType:1,name:1});
  return res.status(200).json({success:true,count:imperialUnits.length,imperialUnits:imperialUnits.map(formatImperialUnit)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching imperial units",error:error.message});
 }
};

export const getImperialUnitById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid imperial unit id"});

  const imperialUnit=await ImperialUnit.findById(id);
  if(!imperialUnit)return res.status(404).json({success:false,message:"Imperial unit not found"});

  return res.status(200).json({success:true,imperialUnit:formatImperialUnit(imperialUnit)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching imperial unit",error:error.message});
 }
};

export const updateImperialUnit=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid imperial unit id"});

  const{name,singular,plural,symbol,code,unitType,baseUnit,conversionFactor,description,notes}=req.body;
  const updateData={};

  if(name!==undefined)updateData.name=String(name).trim();
  if(singular!==undefined)updateData.singular=singular;
  if(plural!==undefined)updateData.plural=plural;
  if(symbol!==undefined)updateData.symbol=String(symbol).trim();
  if(code!==undefined)updateData.code=code;
  if(unitType!==undefined)updateData.unitType=String(unitType).trim().toLowerCase();
  if(baseUnit!==undefined)updateData.baseUnit=Boolean(baseUnit);
  if(conversionFactor!==undefined&&conversionFactor!==null&&conversionFactor!=="")updateData.conversionFactor=mongoose.Types.Decimal128.fromString(String(conversionFactor));
  if(description!==undefined)updateData.description=description;
  if(notes!==undefined)updateData.notes=Array.isArray(notes)?notes.filter(Boolean):[];

  const imperialUnit=await ImperialUnit.findByIdAndUpdate(id,updateData,{returnDocument:"after",runValidators:true});
  if(!imperialUnit)return res.status(404).json({success:false,message:"Imperial unit not found"});

  return res.status(200).json({success:true,message:"Imperial unit updated successfully",imperialUnit:formatImperialUnit(imperialUnit)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error updating imperial unit",error:error.message});
 }
};

export const deleteImperialUnit=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid imperial unit id"});

  const imperialUnit=await ImperialUnit.findByIdAndDelete(id);
  if(!imperialUnit)return res.status(404).json({success:false,message:"Imperial unit not found"});

  return res.status(200).json({success:true,message:"Imperial unit deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting imperial unit",error:error.message});
 }
};