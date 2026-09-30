// backend/models/preservation/infusion/infusionProcessModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const infusionProcessSchema=new mongoose.Schema({
 preservationProject:{type:mongoose.Schema.Types.ObjectId,ref:"PreservationProject",required:true},
 infusionSetup:{type:mongoose.Schema.Types.ObjectId,ref:"InfusionSetup",required:true},

 batchNumber:{type:String,trim:true,default:"",unique:true,sparse:true},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},
 outcomes:[{type:mongoose.Schema.Types.ObjectId,ref:"Outcome"}],

 actual:{
  startDate:{type:Date},
  endDate:{type:Date},
  quantityProcessed:{type:Number,default:0},
  quantityUnit:{type:String,trim:true,default:""},
  baseLiquid:{type:String,trim:true,default:""},
  infusionTime:{type:String,trim:true,default:""},
  totalCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },

 flags:[{
  label:{type:String,trim:true,default:""},
  note:{type:String,trim:true,default:""}
 }],

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"infusion_processes"});

const InfusionProcess=mongoose.models.InfusionProcess||mongoose.model("InfusionProcess",infusionProcessSchema);

export default InfusionProcess;