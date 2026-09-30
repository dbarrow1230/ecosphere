// backend/controllers/costings/costingsController.js
import mongoose from "mongoose";
import Costing from "../../models/costings/costingsModel.js";
import Product from "../../models/products/productsModel.js";
import Ingredient from "../../models/ingredients/ingredientsModel.js";
import Status from "../../models/reference/statusModel.js";
import MetricUnit from "../../models/reference/metricUnitsModel.js";
import ImperialUnit from "../../models/reference/imperialUnitsModel.js";

const makeSlug=value=>String(value||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");

const toDecimal=value=>{
 if(value===undefined||value===null||value==="")return null;
 return mongoose.Types.Decimal128.fromString(String(value));
};

const decimalToString=value=>value!=null?value.toString():"";

const calculateTotals=payload=>{
 const items=Array.isArray(payload.items)?payload.items:[];
 const materialCost=items.reduce((sum,item)=>sum+Number(item.cost||0),0);
 const laborCost=Number(payload.laborCost||0);
 const packagingCost=Number(payload.packagingCost||0);
 const overheadCost=Number(payload.overheadCost||0);
 const totalCost=materialCost+laborCost+packagingCost+overheadCost;
 const batchYield=Number(payload.batchYield||0);
 const unitCost=batchYield>0?totalCost/batchYield:0;
 const targetMarginPercent=payload.targetMarginPercent!==undefined&&payload.targetMarginPercent!==null&&payload.targetMarginPercent!==""?Number(payload.targetMarginPercent):null;
 const suggestedPrice=targetMarginPercent!==null&&targetMarginPercent<100?unitCost/(1-(targetMarginPercent/100)):null;

 return{
  materialCost,
  laborCost,
  packagingCost,
  overheadCost,
  totalCost,
  unitCost,
  targetMarginPercent,
  suggestedPrice
 };
};

const normalizeItems=items=>{
 if(!Array.isArray(items))return[];
 return items.map(item=>({
  ingredient:item.ingredient,
  metricQuantity:item.metricQuantity!==undefined&&item.metricQuantity!==null&&item.metricQuantity!==""?mongoose.Types.Decimal128.fromString(String(item.metricQuantity)):null,
  metricUnit:item.metricUnit||null,
  imperialQuantity:item.imperialQuantity!==undefined&&item.imperialQuantity!==null&&item.imperialQuantity!==""?mongoose.Types.Decimal128.fromString(String(item.imperialQuantity)):null,
  imperialUnit:item.imperialUnit||null,
  cost:item.cost!==undefined&&item.cost!==null&&item.cost!==""?mongoose.Types.Decimal128.fromString(String(item.cost)):mongoose.Types.Decimal128.fromString("0"),
  notes:Array.isArray(item.notes)?item.notes.filter(Boolean):[]
 }));
};

const formatCosting=doc=>{
 const item=doc?.toObject?doc.toObject():doc;
 if(!item)return item;

 return{
  ...item,
  batchSize:decimalToString(item.batchSize),
  batchYield:decimalToString(item.batchYield),
  materialCost:decimalToString(item.materialCost),
  laborCost:decimalToString(item.laborCost),
  packagingCost:decimalToString(item.packagingCost),
  overheadCost:decimalToString(item.overheadCost),
  totalCost:decimalToString(item.totalCost),
  unitCost:decimalToString(item.unitCost),
  targetMarginPercent:decimalToString(item.targetMarginPercent),
  suggestedPrice:decimalToString(item.suggestedPrice),
  items:Array.isArray(item.items)?item.items.map(row=>({
   ...row,
   metricQuantity:decimalToString(row.metricQuantity),
   imperialQuantity:decimalToString(row.imperialQuantity),
   cost:decimalToString(row.cost)
  })):[]
 };
};

const costingPopulate=[
 {path:"product",model:Product,select:"name slug sku"},
 {path:"metricUnit",model:MetricUnit,select:"name singular plural symbol code unitType baseUnit conversionFactor"},
 {path:"imperialUnit",model:ImperialUnit,select:"name singular plural symbol code unitType baseUnit conversionFactor"},
 {path:"items.ingredient",model:Ingredient,select:"name slug botanicalName"},
 {path:"items.metricUnit",model:MetricUnit,select:"name singular plural symbol code unitType baseUnit conversionFactor"},
 {path:"items.imperialUnit",model:ImperialUnit,select:"name singular plural symbol code unitType baseUnit conversionFactor"},
 {path:"status",model:Status,select:"name code color isDefault"}
];

export const createCosting=async(req,res)=>{
 try{
  const{
   name,slug,product,batchSize,batchYield,metricUnit,imperialUnit,items,laborCost,packagingCost,overheadCost,targetMarginPercent,notes,status
  }=req.body;

  if(!name)return res.status(400).json({success:false,message:"Name is required"});
  if(!status)return res.status(400).json({success:false,message:"Status is required"});
  if(product&& !mongoose.Types.ObjectId.isValid(product))return res.status(400).json({success:false,message:"Invalid product id"});
  if(metricUnit&& !mongoose.Types.ObjectId.isValid(metricUnit))return res.status(400).json({success:false,message:"Invalid metric unit id"});
  if(imperialUnit&& !mongoose.Types.ObjectId.isValid(imperialUnit))return res.status(400).json({success:false,message:"Invalid imperial unit id"});
  if(!mongoose.Types.ObjectId.isValid(status))return res.status(400).json({success:false,message:"Invalid status id"});

  const normalizedItems=normalizeItems(items);

  for(const row of normalizedItems){
   if(!row.ingredient||!mongoose.Types.ObjectId.isValid(row.ingredient))return res.status(400).json({success:false,message:"Invalid ingredient id in items"});
   if(row.metricUnit&& !mongoose.Types.ObjectId.isValid(row.metricUnit))return res.status(400).json({success:false,message:"Invalid metric unit id in items"});
   if(row.imperialUnit&& !mongoose.Types.ObjectId.isValid(row.imperialUnit))return res.status(400).json({success:false,message:"Invalid imperial unit id in items"});
  }

  const totals=calculateTotals({items,laborCost,packagingCost,overheadCost,targetMarginPercent,batchYield});

  const costing=new Costing({
   name:name.trim(),
   slug:slug&&String(slug).trim()?makeSlug(slug):makeSlug(name),
   product:product||null,
   batchSize:batchSize!==undefined&&batchSize!==null&&batchSize!==""?mongoose.Types.Decimal128.fromString(String(batchSize)):null,
   batchYield:batchYield!==undefined&&batchYield!==null&&batchYield!==""?mongoose.Types.Decimal128.fromString(String(batchYield)):null,
   metricUnit:metricUnit||null,
   imperialUnit:imperialUnit||null,
   items:normalizedItems,
   materialCost:mongoose.Types.Decimal128.fromString(String(totals.materialCost)),
   laborCost:mongoose.Types.Decimal128.fromString(String(totals.laborCost)),
   packagingCost:mongoose.Types.Decimal128.fromString(String(totals.packagingCost)),
   overheadCost:mongoose.Types.Decimal128.fromString(String(totals.overheadCost)),
   totalCost:mongoose.Types.Decimal128.fromString(String(totals.totalCost)),
   unitCost:mongoose.Types.Decimal128.fromString(String(totals.unitCost)),
   targetMarginPercent:toDecimal(targetMarginPercent),
   suggestedPrice:totals.suggestedPrice!==null?mongoose.Types.Decimal128.fromString(String(totals.suggestedPrice)):null,
   notes:Array.isArray(notes)?notes.filter(Boolean):[],
   status
  });

  const saved=await costing.save();
  const populated=await Costing.findById(saved._id).populate(costingPopulate);

  return res.status(201).json({success:true,message:"Costing created successfully",costing:formatCosting(populated)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error creating costing",error:error.message});
 }
};

export const getCostings=async(req,res)=>{
 try{
  const{search,product,status}=req.query;
  const query={};

  if(product&&mongoose.Types.ObjectId.isValid(product))query.product=product;
  if(status&&mongoose.Types.ObjectId.isValid(status))query.status=status;
  if(search){
   query.$or=[
    {name:{$regex:search,$options:"i"}},
    {slug:{$regex:search,$options:"i"}}
   ];
  }

  const costings=await Costing.find(query).populate(costingPopulate).sort({createdAt:-1});

  return res.status(200).json({success:true,count:costings.length,costings:costings.map(formatCosting)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching costings",error:error.message});
 }
};

export const getCostingById=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid costing id"});

  const costing=await Costing.findById(id).populate(costingPopulate);
  if(!costing)return res.status(404).json({success:false,message:"Costing not found"});

  return res.status(200).json({success:true,costing:formatCosting(costing)});
 }catch(error){
  return res.status(500).json({success:false,message:"Error fetching costing",error:error.message});
 }
};

export const updateCosting=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid costing id"});

  const existing=await Costing.findById(id);
  if(!existing)return res.status(404).json({success:false,message:"Costing not found"});

  const{
   name,slug,product,batchSize,batchYield,metricUnit,imperialUnit,items,laborCost,packagingCost,overheadCost,targetMarginPercent,notes,status
  }=req.body;

  const updateData={};

  if(name!==undefined)updateData.name=String(name).trim();
  if(slug!==undefined)updateData.slug=String(slug).trim()?makeSlug(slug):undefined;
  if(name!==undefined&&slug===undefined)updateData.slug=makeSlug(name);

  if(product!==undefined){
   if(product!==null&&product!==""&&!mongoose.Types.ObjectId.isValid(product))return res.status(400).json({success:false,message:"Invalid product id"});
   updateData.product=product||null;
  }

  if(batchSize!==undefined)updateData.batchSize=batchSize!==null&&batchSize!==""?mongoose.Types.Decimal128.fromString(String(batchSize)):null;
  if(batchYield!==undefined)updateData.batchYield=batchYield!==null&&batchYield!==""?mongoose.Types.Decimal128.fromString(String(batchYield)):null;

  if(metricUnit!==undefined){
   if(metricUnit!==null&&metricUnit!==""&&!mongoose.Types.ObjectId.isValid(metricUnit))return res.status(400).json({success:false,message:"Invalid metric unit id"});
   updateData.metricUnit=metricUnit||null;
  }

  if(imperialUnit!==undefined){
   if(imperialUnit!==null&&imperialUnit!==""&&!mongoose.Types.ObjectId.isValid(imperialUnit))return res.status(400).json({success:false,message:"Invalid imperial unit id"});
   updateData.imperialUnit=imperialUnit||null;
  }

  if(items!==undefined){
   const normalizedItems=normalizeItems(items);
   for(const row of normalizedItems){
    if(!row.ingredient||!mongoose.Types.ObjectId.isValid(row.ingredient))return res.status(400).json({success:false,message:"Invalid ingredient id in items"});
    if(row.metricUnit&& !mongoose.Types.ObjectId.isValid(row.metricUnit))return res.status(400).json({success:false,message:"Invalid metric unit id in items"});
    if(row.imperialUnit&& !mongoose.Types.ObjectId.isValid(row.imperialUnit))return res.status(400).json({success:false,message:"Invalid imperial unit id in items"});
   }
   updateData.items=normalizedItems;
  }

  if(notes!==undefined)updateData.notes=Array.isArray(notes)?notes.filter(Boolean):[];

  if(status!==undefined){
   if(!mongoose.Types.ObjectId.isValid(status))return res.status(400).json({success:false,message:"Invalid status id"});
   updateData.status=status;
  }

  const sourceItems=items!==undefined?items:(existing.items||[]).map(row=>({
   ingredient:row.ingredient,
   metricQuantity:row.metricQuantity!=null?row.metricQuantity.toString():"",
   metricUnit:row.metricUnit,
   imperialQuantity:row.imperialQuantity!=null?row.imperialQuantity.toString():"",
   imperialUnit:row.imperialUnit,
   cost:row.cost!=null?row.cost.toString():"0",
   notes:row.notes||[]
  }));

  const sourceLaborCost=laborCost!==undefined?laborCost:(existing.laborCost!=null?existing.laborCost.toString():"0");
  const sourcePackagingCost=packagingCost!==undefined?packagingCost:(existing.packagingCost!=null?existing.packagingCost.toString():"0");
  const sourceOverheadCost=overheadCost!==undefined?overheadCost:(existing.overheadCost!=null?existing.overheadCost.toString():"0");
  const sourceTargetMarginPercent=targetMarginPercent!==undefined?targetMarginPercent:(existing.targetMarginPercent!=null?existing.targetMarginPercent.toString():"");

  const totals=calculateTotals({
   items:sourceItems,
   laborCost:sourceLaborCost,
   packagingCost:sourcePackagingCost,
   overheadCost:sourceOverheadCost,
   targetMarginPercent:sourceTargetMarginPercent
  });

  updateData.materialCost=mongoose.Types.Decimal128.fromString(String(totals.materialCost));
  updateData.laborCost=mongoose.Types.Decimal128.fromString(String(totals.laborCost));
  updateData.packagingCost=mongoose.Types.Decimal128.fromString(String(totals.packagingCost));
  updateData.overheadCost=mongoose.Types.Decimal128.fromString(String(totals.overheadCost));
  updateData.totalCost=mongoose.Types.Decimal128.fromString(String(totals.totalCost));

  const effectiveBatchYield=batchYield!==undefined?Number(batchYield||0):(existing.batchYield!=null?Number(existing.batchYield.toString()):0);
  const unitCost=effectiveBatchYield>0?totals.totalCost/effectiveBatchYield:0;
  updateData.unitCost=mongoose.Types.Decimal128.fromString(String(unitCost));
  updateData.targetMarginPercent=toDecimal(sourceTargetMarginPercent);
  updateData.suggestedPrice=totals.targetMarginPercent!==null&&totals.targetMarginPercent<100?mongoose.Types.Decimal128.fromString(String(unitCost/(1-(totals.targetMarginPercent/100)))):null;

  const costing=await Costing.findByIdAndUpdate(id,updateData,{returnDocument:"after",runValidators:true}).populate(costingPopulate);

  return res.status(200).json({success:true,message:"Costing updated successfully",costing:formatCosting(costing)});
 }catch(error){
  if(error.code===11000){
   const field=Object.keys(error.keyPattern||{})[0]||"field";
   return res.status(409).json({success:false,message:`${field} already exists`});
  }
  return res.status(500).json({success:false,message:"Error updating costing",error:error.message});
 }
};

export const deleteCosting=async(req,res)=>{
 try{
  const{id}=req.params;
  if(!mongoose.Types.ObjectId.isValid(id))return res.status(400).json({success:false,message:"Invalid costing id"});

  const costing=await Costing.findByIdAndDelete(id);
  if(!costing)return res.status(404).json({success:false,message:"Costing not found"});

  return res.status(200).json({success:true,message:"Costing deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Error deleting costing",error:error.message});
 }
};