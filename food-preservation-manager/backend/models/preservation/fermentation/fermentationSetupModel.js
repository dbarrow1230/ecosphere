// backend/models/preservation/fermentationSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const fermentationSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 fermentationType:{type:String,trim:true,default:""}, // dough, lacto, other
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 defaults:{
  duration:{type:String,trim:true,default:""},
  temperature:{type:String,trim:true,default:""},
  hydration:{type:String,trim:true,default:""},
  salinity:{type:String,trim:true,default:""}
 },

 estimatedYield:{
  quantity:{type:Number,default:0},
  unit:{type:String,trim:true,default:""}
 },

 instructions:{
  preparation:[{type:String,trim:true}],
  fermentation:[{type:String,trim:true}],
  storage:[{type:String,trim:true}],
  notes:{type:String,trim:true,default:""}
 },

 pricingDefaults:{
  baseCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"fermentation_setups"});

const FermentationSetup=mongoose.models.FermentationSetup||mongoose.model("FermentationSetup",fermentationSetupSchema);

export default FermentationSetup;