// backend/models/vacationBalanceModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const balanceEntrySchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 type:{type:String,enum:["accrual","adjustment","used","carryover","reset"],required:true},
 hours:{type:Number,required:true},
 referenceType:{type:String,enum:["manual","timeOffRequest","payroll","system"],default:"manual"},
 referenceId:{type:mongoose.Schema.Types.ObjectId,default:null},
 note:{type:String,trim:true,default:""}
},{_id:false});

const vacationBalanceSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},
 timeOffType:{type:mongoose.Schema.Types.ObjectId,ref:"TimeOffType",required:true,index:true},

 year:{type:Number,required:true,index:true},

 openingHours:{type:Number,default:0},
 accruedHours:{type:Number,default:0},
 usedHours:{type:Number,default:0},
 adjustedHours:{type:Number,default:0},
 carryoverHours:{type:Number,default:0},
 availableHours:{type:Number,default:0},

 entries:{type:[balanceEntrySchema],default:[]},
 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"vacation_balances"});

vacationBalanceSchema.index({business:1,employee:1,timeOffType:1,year:1},{unique:true});
vacationBalanceSchema.index({business:1,employee:1,year:1});

const VacationBalance=mongoose.models.VacationBalance||mongoose.model("VacationBalance",vacationBalanceSchema);

export default VacationBalance;