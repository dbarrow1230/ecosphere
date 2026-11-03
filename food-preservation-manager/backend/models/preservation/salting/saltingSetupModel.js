// backend/models/preservation/salting/saltingSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const saltingSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 methodType:{type:String,trim:true,default:""}, // dry_salt, brine
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 salting:{
  saltRatio:{type:String,trim:true,default:""},
  saltingTime:{type:String,trim:true,default:""},
  drainageRequired:{type:Boolean,default:false},
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
},{timestamps:true,collection:"salting_setups"});

const SaltingSetup=mongoose.models.SaltingSetup||mongoose.model("SaltingSetup",saltingSetupSchema);

export default SaltingSetup;