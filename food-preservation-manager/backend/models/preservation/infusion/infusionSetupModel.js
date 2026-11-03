// backend/models/preservation/infusion/infusionSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const infusionSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 methodType:{type:String,trim:true,default:""}, // vinegar, oil, alcohol, syrup
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 infusion:{
  baseLiquid:{type:String,trim:true,default:""},
  infusionTime:{type:String,trim:true,default:""},
  storageTemperature:{type:String,trim:true,default:""},
  strainRequired:{type:Boolean,default:false}
 },

 estimatedYield:{
  quantity:{type:Number,default:0},
  unit:{type:String,trim:true,default:""}
 },

 instructions:{
  preparation:[{type:String,trim:true}],
  processing:[{type:String,trim:true}],
  storage:[{type:String,trim:true}],
  notes:{type:String,trim:true,default:""}
 },

 pricingDefaults:{
  baseCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"infusion_setups"});

const InfusionSetup=mongoose.models.InfusionSetup||mongoose.model("InfusionSetup",infusionSetupSchema);

export default InfusionSetup;