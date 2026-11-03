import {GardenLocationType,GardenPurpose,GardenReason,GardenType} from "../../models/gardens/gardenReferenceModels.js";
import MetricUnit from "../../models/reference/MetricUnitModel.js";
import ImperialUnit from "../../models/reference/ImperialUnitModel.js";

export const getGardenReferences=async(req,res)=>{
 try{
  const [types,purposes,reasons,locationTypes,metricUnits,imperialUnits]=await Promise.all([
   GardenType.find({isActive:true}).sort({name:1}),
   GardenPurpose.find({isActive:true}).sort({name:1}),
   GardenReason.find({isActive:true}).sort({name:1}),
   GardenLocationType.find({isActive:true}).sort({name:1}),
   MetricUnit.find({type:"length",isActive:true}).sort({name:1}),
   ImperialUnit.find({type:"length",isActive:true}).sort({name:1})
  ]);
  return res.status(200).json({types,purposes,reasons,locationTypes,metricUnits,imperialUnits});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};
