// backend/models/preservation/curing/curingSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const curingSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 methodType:{type:String,trim:true,default:""}, // dry, wet, salt, sugar
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 curing:{
  saltRatio:{type:String,trim:true,default:""},
  sugarRatio:{type:String,trim:true,default:""},
  cureDuration:{type:String,trim:true,default:""},
  temperature:{type:String,trim:true,default:""},
  humidity:{type:String,trim:true,default:""}
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
},{timestamps:true,collection:"curing_setups"});

const CuringSetup=mongoose.models.CuringSetup||mongoose.model("CuringSetup",curingSetupSchema);

export default CuringSetup;