// backend/models/preservation/smoking/smokingSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const smokingSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 methodType:{type:String,trim:true,default:""}, // hot, cold
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 smoking:{
  woodType:{type:String,trim:true,default:""},
  smokerTemperature:{type:String,trim:true,default:""},
  smokingTime:{type:String,trim:true,default:""},
  preCureRequired:{type:Boolean,default:false}
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
},{timestamps:true,collection:"smoking_setups"});

const SmokingSetup=mongoose.models.SmokingSetup||mongoose.model("SmokingSetup",smokingSetupSchema);

export default SmokingSetup;