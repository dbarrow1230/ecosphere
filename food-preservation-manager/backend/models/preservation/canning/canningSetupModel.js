// backend/models/preservation/canningSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const canningSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 methodType:{type:String,trim:true,default:""}, // water_bath, pressure_canning
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 processing:{
  jarSize:{type:String,trim:true,default:""},
  headspace:{type:String,trim:true,default:""},
  processingTime:{type:String,trim:true,default:""},
  pressure:{type:String,trim:true,default:""},
  temperature:{type:String,trim:true,default:""}
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
},{timestamps:true,collection:"canning_setups"});

const CanningSetup=mongoose.models.CanningSetup||mongoose.model("CanningSetup",canningSetupSchema);

export default CanningSetup;