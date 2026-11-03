// backend/models/preservation/salting/saltingProcessModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const saltingProcessSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},
 saltingSetup:{type:mongoose.Schema.Types.ObjectId,ref:"SaltingSetup",required:true},

 batchNumber:{type:String,trim:true,default:"",unique:true,sparse:true},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},
 outcomes:[{type:mongoose.Schema.Types.ObjectId,ref:"Outcome"}],

 actual:{
  startDate:{type:Date},
  endDate:{type:Date},
  quantityProcessed:{type:Number,default:0},
  quantityUnit:{type:String,trim:true,default:""},
  saltUsed:{type:String,trim:true,default:""},
  saltingTime:{type:String,trim:true,default:""},
  totalCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 flags:[{
  label:{type:String,trim:true,default:""},
  note:{type:String,trim:true,default:""}
 }],

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"salting_processes"});

const SaltingProcess=mongoose.models.SaltingProcess||mongoose.model("SaltingProcess",saltingProcessSchema);

export default SaltingProcess;