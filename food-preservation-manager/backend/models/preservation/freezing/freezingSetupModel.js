// backend/models/preservation/freezing/freezingSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const freezingSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 methodType:{type:String,trim:true,default:""}, // raw, blanched, cooked, tray_freeze
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 processing:{
  blanchTime:{type:String,trim:true,default:""},
  coolingMethod:{type:String,trim:true,default:""},
  packagingType:{type:String,trim:true,default:""},
  freezerTemperature:{type:String,trim:true,default:""}
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
},{timestamps:true,collection:"freezing_setups"});

const FreezingSetup=mongoose.models.FreezingSetup||mongoose.model("FreezingSetup",freezingSetupSchema);

export default FreezingSetup;