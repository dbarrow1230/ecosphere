// backend/models/preservation/oilPacking/oilPackingSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const oilPackingSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 methodType:{type:String,trim:true,default:""}, // herb, vegetable, flavor
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 packing:{
  oilType:{type:String,trim:true,default:""},
  acidificationRequired:{type:Boolean,default:false},
  storageTemperature:{type:String,trim:true,default:""},
  prepMethod:{type:String,trim:true,default:""}
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
},{timestamps:true,collection:"oil_packing_setups"});

const OilPackingSetup=mongoose.models.OilPackingSetup||mongoose.model("OilPackingSetup",oilPackingSetupSchema);

export default OilPackingSetup;