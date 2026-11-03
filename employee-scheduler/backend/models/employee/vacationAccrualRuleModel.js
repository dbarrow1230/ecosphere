// backend/models/vacationAccrualRuleModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const vacationAccrualRuleSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 department:{type:mongoose.Schema.Types.ObjectId,ref:"Department",default:null,index:true},
 role:{type:mongoose.Schema.Types.ObjectId,ref:"Role",default:null,index:true},
 timeOffType:{type:mongoose.Schema.Types.ObjectId,ref:"TimeOffType",required:true,index:true},

 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},

 accrualMethod:{type:String,enum:["per-hour-worked","per-pay-period","monthly","yearly"],default:"per-pay-period"},
 accrualRate:{type:Number,default:0,min:0},

 maxHoursPerYear:{type:Number,default:0,min:0},
 maxCarryoverHours:{type:Number,default:0,min:0},

 waitingPeriodDays:{type:Number,default:0,min:0},
 minimumEmploymentDays:{type:Number,default:0,min:0},

 isActive:{type:Boolean,default:true},
 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"vacation_accrual_rules"});

vacationAccrualRuleSchema.index({business:1,name:1},{unique:true});
vacationAccrualRuleSchema.index({business:1,code:1},{unique:true,sparse:true});
vacationAccrualRuleSchema.index({business:1,timeOffType:1,isActive:1});

const VacationAccrualRule=mongoose.models.VacationAccrualRule||mongoose.model("VacationAccrualRule",vacationAccrualRuleSchema);

export default VacationAccrualRule;