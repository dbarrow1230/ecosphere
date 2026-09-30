// backend/models/preservation/canningProcessModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const canningProcessSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},
 canningSetup:{type:mongoose.Schema.Types.ObjectId,ref:"CanningSetup",required:true},

 batchNumber:{type:String,trim:true,default:"",unique:true,sparse:true},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},
 outcomes:[{type:mongoose.Schema.Types.ObjectId,ref:"Outcome"}],

 actual:{
  startDate:{type:Date},
  endDate:{type:Date},
  jarCount:{type:Number,default:0},
  sealFailures:{type:Number,default:0},
  quantityProcessed:{type:Number,default:0},
  quantityUnit:{type:String,trim:true,default:""},
  totalCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 flags:[{
  label:{type:String,trim:true,default:""},
  note:{type:String,trim:true,default:""}
 }],

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"canning_processes"});

const CanningProcess=mongoose.models.CanningProcess||mongoose.model("CanningProcess",canningProcessSchema);

export default CanningProcess;