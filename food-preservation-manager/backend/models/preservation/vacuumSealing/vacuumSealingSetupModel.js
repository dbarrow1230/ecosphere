// backend/models/preservation/vacuumSealing/vacuumSealingSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const vacuumSealingSetupSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},

 name:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 methodType:{type:String,trim:true,default:""}, // dry, wet, freezer, sous_vide_prep
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 sealing:{
  bagType:{type:String,trim:true,default:""},
  sealLevel:{type:String,trim:true,default:""},
  doubleSeal:{type:Boolean,default:false},
  storageTarget:{type:String,trim:true,default:""}
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
},{timestamps:true,collection:"vacuum_sealing_setups"});

const VacuumSealingSetup=mongoose.models.VacuumSealingSetup||mongoose.model("VacuumSealingSetup",vacuumSealingSetupSchema);

export default VacuumSealingSetup;