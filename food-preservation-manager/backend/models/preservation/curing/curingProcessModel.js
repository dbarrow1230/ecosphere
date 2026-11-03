// backend/models/preservation/curing/curingProcessModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const curingProcessSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},
 curingSetup:{type:mongoose.Schema.Types.ObjectId,ref:"CuringSetup",required:true},

 batchNumber:{type:String,trim:true,default:"",unique:true,sparse:true},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},
 outcomes:[{type:mongoose.Schema.Types.ObjectId,ref:"Outcome"}],

 actual:{
  startDate:{type:Date},
  endDate:{type:Date},
  quantityProcessed:{type:Number,default:0},
  quantityUnit:{type:String,trim:true,default:""},
  cureDuration:{type:String,trim:true,default:""},
  weightLoss:{type:String,trim:true,default:""},
  totalCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 flags:[{
  label:{type:String,trim:true,default:""},
  note:{type:String,trim:true,default:""}
 }],

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"curing_processes"});

const CuringProcess=mongoose.models.CuringProcess||mongoose.model("CuringProcess",curingProcessSchema);

export default CuringProcess;