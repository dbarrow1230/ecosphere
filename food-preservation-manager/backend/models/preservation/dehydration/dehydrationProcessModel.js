// backend/models/dehydrationProcessModel.js
import mongoose from "mongoose";

const d=v=>v==null?v:mongoose.Types.Decimal128.fromString(String(v));

const scheduleItemSchema=new mongoose.Schema({
 date:{type:Date},
 time:{type:String,trim:true,default:""},
 action:{type:String,trim:true,default:""}
},{_id:false});

const intervalNoteSchema=new mongoose.Schema({
 date:{type:Date},
 time:{type:String,trim:true,default:""},
 note:{type:String,trim:true,default:""}
},{_id:false});

const dehydrationProcessSchema=new mongoose.Schema({
 dehydrationSetup:{type:mongoose.Schema.Types.ObjectId,ref:"DehydrationSetup",required:true},
 batchName:{type:String,trim:true,required:true},
 method:{type:String,enum:["dehydrator","oven"],required:true},
 electricityRate:{type:mongoose.Schema.Types.ObjectId,ref:"ElectricityRate"},
 setupSnapshot:{type:mongoose.Schema.Types.Mixed},
 operationalData:{
  trayCount:{type:Number,min:0,default:0},
  actualTemperature:{type:String,trim:true,default:""},
  startDate:{type:Date},
  startTime:{type:String,trim:true,default:""},
  endDate:{type:Date},
  endTime:{type:String,trim:true,default:""},
  intervalNotes:[intervalNoteSchema]
 },

 itemDetails:{
  marketPriceRef:{type:mongoose.Schema.Types.ObjectId,ref:"MarketPrice"},
  weightBeforeDehydration:{
   pounds:{type:Number,default:0},
   ounces:{type:Number,default:0}
  },
  totalCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  costPerPound:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  costPerOunce:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  startDate:{type:Date},
  estimatedEndDate:{type:Date}
 },

 processSchedules:{
  dehydratorSchedule:[scheduleItemSchema],
  ovenSchedule:[scheduleItemSchema]
 },

 actualResults:{
  actualFinalWeight:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  completedDate:{type:Date}
 },

 finalNotes:{type:String,trim:true,default:""},
 status:{type:String,enum:["planned","in_progress","completed","cancelled"],default:"planned"}
},{timestamps:true,collection:"dehydration_processes"});

const DehydrationProcess=mongoose.models.DehydrationProcess||mongoose.model("DehydrationProcess",dehydrationProcessSchema);

export default DehydrationProcess;
