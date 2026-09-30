// backend/models/preservation/pickling/picklingSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const picklingSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 methodType:{type:String,trim:true,default:""}, // quick, fermented
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 brine:{
  vinegarRatio:{type:String,trim:true,default:""},
  saltRatio:{type:String,trim:true,default:""},
  sugarRatio:{type:String,trim:true,default:""},
  spices:{type:String,trim:true,default:""}
 },

 processing:{
  restingTime:{type:String,trim:true,default:""},
  storageTemperature:{type:String,trim:true,default:""}
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
},{timestamps:true,collection:"pickling_setups"});

const PicklingSetup=mongoose.models.PicklingSetup||mongoose.model("PicklingSetup",picklingSetupSchema);

export default PicklingSetup;