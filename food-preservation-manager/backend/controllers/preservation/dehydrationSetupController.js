import mongoose from "mongoose";
import "../../models/preservation/dehydration/dehydratorModel.js";
import "../../models/finance/fuelSourceModel.js";
import DehydrationSetup from "../../models/preservation/dehydration/dehydrationSetupModel.js";

const isValidObjectId=value=>!!value&&mongoose.Types.ObjectId.isValid(value);

const normalizeObjectId=value=>isValidObjectId(value)?value:null;

const normalizeDecimal=value=>{
 if(value===undefined||value===null||value===""){
  return "0";
 }
 return String(value);
};

const normalizeMinMax=value=>({
 min:normalizeDecimal(value?.min),
 max:normalizeDecimal(value?.max)
});

const normalizeDateTimeRange=value=>({
 minDate:value?.minDate||null,
 minTime:value?.minTime||"",
 maxDate:value?.maxDate||null,
 maxTime:value?.maxTime||""
});

const normalizeScheduleItem=value=>({
 date:value?.date||null,
 time:value?.time||"",
 action:value?.action||""
});

const normalizePrepItem=value=>({
 step:Number(value?.step||0),
 date:value?.date||null,
 time:value?.time||"",
 action:value?.action||"",
 preparation:value?.preparation||""
});

const normalizeBeforeDehydrationRow=value=>({
 weight:normalizeDecimal(value?.weight),
 pricePerUnit:normalizeDecimal(value?.pricePerUnit),
 totalPrice:normalizeDecimal(value?.totalPrice)
});

const normalizeAfterDehydrationRow=value=>({
 weightAfterDehydration:normalizeDecimal(value?.weightAfterDehydration),
 pricePerUnit:normalizeDecimal(value?.pricePerUnit),
 totalPrice:normalizeDecimal(value?.totalPrice)
});

const normalizeCostSummaryRow=value=>({
 method:value?.method||"",
 wattage:normalizeDecimal(value?.wattage),
 energyUsedKwh:normalizeDecimal(value?.energyUsedKwh),
 energyCost:normalizeDecimal(value?.energyCost),
 totalCost:normalizeDecimal(value?.totalCost)
});

const normalizeEquivalentRow=value=>({
 freshAmount:value?.freshAmount||"",
 driedEquivalent:value?.driedEquivalent||"",
 equivalentLb:normalizeDecimal(value?.equivalentLb),
 equivalentOz:normalizeDecimal(value?.equivalentOz),
 equivalentGrams:normalizeDecimal(value?.equivalentGrams)
});

const normalizeStatus=(value,isActive=true)=>{
 const status=String(value||"").trim().toLowerCase();
 if(["active","inactive","paused","completed","cancelled"].includes(status))return status;
 return isActive===false?"inactive":"active";
};

const normalizePayload=body=>({
 item:body?.item?.trim?.()||"",
 dehydrator:normalizeObjectId(body?.dehydrator),
 fuelSource:normalizeObjectId(body?.fuelSource),

 dehydrationMethods:{
  dehydratorMethod:{
   suggestedTemperatureRange:body?.dehydrationMethods?.dehydratorMethod?.suggestedTemperatureRange||"95–115°F (35–46°C)",
   estimatedDuration:body?.dehydrationMethods?.dehydratorMethod?.estimatedDuration||"",
   estimatedEnergyConsumption:normalizeMinMax(body?.dehydrationMethods?.dehydratorMethod?.estimatedEnergyConsumption),
   estimatedEnergyCost:normalizeMinMax(body?.dehydrationMethods?.dehydratorMethod?.estimatedEnergyCost),
   estimatedEndDateTime:normalizeDateTimeRange(body?.dehydrationMethods?.dehydratorMethod?.estimatedEndDateTime)
  },
  ovenMethod:{
   temperature:body?.dehydrationMethods?.ovenMethod?.temperature||"",
   estimatedTime:body?.dehydrationMethods?.ovenMethod?.estimatedTime||"",
   energyConsumption:normalizeMinMax(body?.dehydrationMethods?.ovenMethod?.energyConsumption),
   estimatedEnergyCost:normalizeMinMax(body?.dehydrationMethods?.ovenMethod?.estimatedEnergyCost),
   estimatedEndDateTime:normalizeDateTimeRange(body?.dehydrationMethods?.ovenMethod?.estimatedEndDateTime)
  }
 },

 predictedWeightAfterDehydration:{
  expectedWeightLoss:normalizeDecimal(body?.predictedWeightAfterDehydration?.expectedWeightLoss),
  predictedWeight:normalizeDecimal(body?.predictedWeightAfterDehydration?.predictedWeight),
  predictedFinalWeight:normalizeMinMax(body?.predictedWeightAfterDehydration?.predictedFinalWeight)
 },

 totalCostSummary:Array.isArray(body?.totalCostSummary)?body.totalCostSummary.map(normalizeCostSummaryRow):[],

 marketPriceCalculationDefaults:{
  beforeDehydration:{
   pounds:normalizeBeforeDehydrationRow(body?.marketPriceCalculationDefaults?.beforeDehydration?.pounds),
   ounces:normalizeBeforeDehydrationRow(body?.marketPriceCalculationDefaults?.beforeDehydration?.ounces),
   grams:normalizeBeforeDehydrationRow(body?.marketPriceCalculationDefaults?.beforeDehydration?.grams)
  },
  afterDehydration:{
   pounds:normalizeAfterDehydrationRow(body?.marketPriceCalculationDefaults?.afterDehydration?.pounds),
   ounces:normalizeAfterDehydrationRow(body?.marketPriceCalculationDefaults?.afterDehydration?.ounces),
   grams:normalizeAfterDehydrationRow(body?.marketPriceCalculationDefaults?.afterDehydration?.grams)
  },
  costPerUnitCalculation:{
   totalCost:normalizeDecimal(body?.marketPriceCalculationDefaults?.costPerUnitCalculation?.totalCost),
   totalWeight:normalizeDecimal(body?.marketPriceCalculationDefaults?.costPerUnitCalculation?.totalWeight),
   costPerUnit:normalizeDecimal(body?.marketPriceCalculationDefaults?.costPerUnitCalculation?.costPerUnit)
  }
 },

 defaultSchedules:{
  dehydratorSchedule:Array.isArray(body?.defaultSchedules?.dehydratorSchedule)?body.defaultSchedules.dehydratorSchedule.map(normalizeScheduleItem):[],
  ovenSchedule:Array.isArray(body?.defaultSchedules?.ovenSchedule)?body.defaultSchedules.ovenSchedule.map(normalizeScheduleItem):[]
 },

 preparationInstructions:Array.isArray(body?.preparationInstructions)?body.preparationInstructions.map(normalizePrepItem):[],

 storageInstructions:{
  instructions:Array.isArray(body?.storageInstructions?.instructions)?body.storageInstructions.instructions.filter(item=>typeof item==="string").map(item=>item.trim()).filter(Boolean):[],
  shelfLife:{
   roomTemperature:body?.storageInstructions?.shelfLife?.roomTemperature||"",
   freezer:body?.storageInstructions?.shelfLife?.freezer||"",
   powder:body?.storageInstructions?.shelfLife?.powder||""
  }
 },

 rehydrationInstructions:body?.rehydrationInstructions||"",
 equivalentsTable:Array.isArray(body?.equivalentsTable)?body.equivalentsTable.map(normalizeEquivalentRow):[],
 finalNotes:body?.finalNotes||"",
 status:normalizeStatus(body?.status,body?.isActive),
 isActive:normalizeStatus(body?.status,body?.isActive)!=="inactive"
});

export const getAll=async(req,res)=>{
 try{
  const setups=await DehydrationSetup.find()
  .populate("dehydrator")
  .populate("fuelSource")
  .sort({item:1});

  res.json({data:setups});
 }catch(err){
  res.status(500).json({message:err.message});
 }
};

export const getById=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({message:"Invalid dehydration setup id"});
  }

  const setup=await DehydrationSetup.findById(req.params.id)
  .populate("dehydrator")
  .populate("fuelSource");

  if(!setup) return res.status(404).json({message:"Not found"});
  res.json({data:setup});
 }catch(err){
  res.status(500).json({message:err.message});
 }
};

export const create=async(req,res)=>{
 try{
  const payload=normalizePayload(req.body);

  if(!payload.item){
   return res.status(400).json({message:"Item is required"});
  }

  const setup=new DehydrationSetup(payload);
  const saved=await setup.save();
  const populated=await DehydrationSetup.findById(saved._id)
  .populate("dehydrator")
  .populate("fuelSource");

  res.status(201).json({message:"Dehydration setup created",data:populated});
 }catch(err){
  res.status(400).json({message:err.message});
 }
};

export const update=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({message:"Invalid dehydration setup id"});
  }

  const payload=normalizePayload(req.body);

  if(!payload.item){
   return res.status(400).json({message:"Item is required"});
  }

  const setup=await DehydrationSetup.findByIdAndUpdate(
   req.params.id,
   payload,
   {returnDocument:"after",runValidators:true}
  )
  .populate("dehydrator")
  .populate("fuelSource");

  if(!setup) return res.status(404).json({message:"Not found"});
  res.json({message:"Dehydration setup updated",data:setup});
 }catch(err){
  res.status(400).json({message:err.message});
 }
};

export const remove=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({message:"Invalid dehydration setup id"});
  }

  const setup=await DehydrationSetup.findByIdAndDelete(req.params.id);
  if(!setup) return res.status(404).json({message:"Not found"});
  res.json({message:"Deleted"});
 }catch(err){
  res.status(500).json({message:err.message});
 }
};
