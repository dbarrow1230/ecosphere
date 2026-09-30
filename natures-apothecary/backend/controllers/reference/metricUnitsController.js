// backend/controllers/reference/metricUnitsController.js
import mongoose from "mongoose";
import MetricUnit from "../../models/reference/metricUnitsModel.js";

const formatMetricUnit=doc=>{
 const item=doc?.toObject?doc.toObject():doc;
 if(!item)return item;
 return{
  ...item,
  conversionFactor:item.conversionFactor!=null?item.conversionFactor.toString():"1"
 };
};

export const createMetricUnit=async(req,res)=>{
 try{
  const{name,singular,plural,symbol,code,unitType,baseUnit,conversionFactor,description,notes}=req.body;

  if(!name)return res.status(400).json({success:false,message:"Name is required"});
  if(!symbol)return res.status(400).json({success:false,message:"Symbol is required"});
  if(!unitType)return res.status(400).json({success:false,message:"Unit type is required"});

  const metricUnit=new MetricUnit({
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

  const saved=await metricUnit.save();
  return res.status(201).json({success:true,message:"Metric unit created successfully",metricUnit:formatMetricUnit(saved)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error creating metric unit",error:error.message});
 }
};

export const getMetricUnits=async(req,res)=>{
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

  const metricUnits=await MetricUnit.find(query).sort({unitType:1,name:1});
  return res.status(200).json({success:true,count:metricUnits.length,metricUnits:metricUnits.map(formatMetricUnit)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching metric units",error:error.message});
 }
};

export const getMetricUnitById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid metric unit id"});

  const metricUnit=await MetricUnit.findById(id);
  if(!metricUnit)return res.status(404).json({success:false,message:"Metric unit not found"});

  return res.status(200).json({success:true,metricUnit:formatMetricUnit(metricUnit)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching metric unit",error:error.message});
 }
};

export const updateMetricUnit=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid metric unit id"});

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

  const metricUnit=await MetricUnit.findByIdAndUpdate(id,updateData,{returnDocument:"after",runValidators:true});
  if(!metricUnit)return res.status(404).json({success:false,message:"Metric unit not found"});

  return res.status(200).json({success:true,message:"Metric unit updated successfully",metricUnit:formatMetricUnit(metricUnit)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error updating metric unit",error:error.message});
 }
};

export const deleteMetricUnit=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid metric unit id"});

  const metricUnit=await MetricUnit.findByIdAndDelete(id);
  if(!metricUnit)return res.status(404).json({success:false,message:"Metric unit not found"});

  return res.status(200).json({success:true,message:"Metric unit deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting metric unit",error:error.message});
 }
};