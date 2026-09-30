import {GardenLocationType,GardenPurpose,GardenReason,GardenType} from "../../models/gardens/gardenReferenceModels.js";
import Garden from "../../models/gardens/gardenModel.js";
import MetricUnit from "../../models/reference/MetricUnitModel.js";
import ImperialUnit from "../../models/reference/ImperialUnitModel.js";

const defaults={
 types:["Outdoor Garden","Raised Bed Garden","Container Garden","Indoor Garden","Hydroponic Garden","Greenhouse","Community Garden","Other"],
 purposes:["Food Production","Herbs","Flowers & Pollinators","Seed Saving","Education","Experimentation","Decoration"],
 reasons:["Fresh Food","Save Money","Sustainability","Hobby","Health","Community","Research"],
 locations:["Raised Bed","In-Ground Bed","Container","Row","Plot","Hydro Device","Tray","Shelf","Greenhouse Zone","Other"]
};

const measurementDefaults={
 metric:[
  {name:"Meter",symbol:"m",type:"length",description:"Metric length unit"},
  {name:"Centimeter",symbol:"cm",type:"length",description:"Metric length unit"}
 ],
 imperial:[
  {name:"Foot",symbol:"ft",type:"length",description:"Imperial length unit"},
  {name:"Inch",symbol:"in",type:"length",description:"Imperial length unit"},
  {name:"Yard",symbol:"yd",type:"length",description:"Imperial length unit"}
 ]
};

const ensureDefaults=async(Model,names)=>{
 await Promise.all(names.map(name=>Model.updateOne({name},{$setOnInsert:{name,isActive:true}},{upsert:true})));
 return Model.find({isActive:true}).sort({name:1});
};

const ensureMeasurementDefaults=async(Model,items)=>{
 await Promise.all(items.map(item=>Model.updateOne(
  {$or:[{name:item.name},{symbol:item.symbol}]},
  {$setOnInsert:{...item,isActive:true}},
  {upsert:true}
 )));
 return Model.find({type:"length",isActive:true}).sort({name:1});
};

export const getGardenReferences=async(req,res)=>{
 try{
  const [types,purposes,reasons,locationTypes,metricUnits,imperialUnits]=await Promise.all([
   ensureDefaults(GardenType,defaults.types),
   ensureDefaults(GardenPurpose,defaults.purposes),
   ensureDefaults(GardenReason,defaults.reasons),
   ensureDefaults(GardenLocationType,defaults.locations),
   ensureMeasurementDefaults(MetricUnit,measurementDefaults.metric),
   ensureMeasurementDefaults(ImperialUnit,measurementDefaults.imperial)
  ]);
  const legacyAliases={"Raised Bed":"Raised Bed Garden"};
  await Promise.all(types.map(type=>Garden.collection.updateMany(
   {gardenType:null,gardenKind:{$in:[type.name,...Object.keys(legacyAliases).filter(name=>legacyAliases[name]===type.name)]}},
   {$set:{gardenType:type._id}}
  )));
  return res.status(200).json({types,purposes,reasons,locationTypes,metricUnits,imperialUnits});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};
