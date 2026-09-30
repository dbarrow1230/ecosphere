// backend/models/preservation/powder/powderSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const powderSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 methodType:{type:String,trim:true,default:""}, // powdering, grinding
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 processing:{
  sourceMaterial:{type:String,trim:true,default:""},
  grindLevel:{type:String,trim:true,default:""},
  sieveRequired:{type:Boolean,default:false},
  antiCakingUsed:{type:Boolean,default:false}
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
},{timestamps:true,collection:"powder_setups"});

const PowderSetup=mongoose.models.PowderSetup||mongoose.model("PowderSetup",powderSetupSchema);

export default PowderSetup;