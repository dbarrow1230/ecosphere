// backend/models/payroll/payrollPeriodModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const payrollPeriodSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 name:{type:String,trim:true,default:""},
 code:{type:String,trim:true,uppercase:true,default:""},

 startDate:{type:Date,required:true,index:true},
 endDate:{type:Date,required:true,index:true},
 payDate:{type:Date,default:null,index:true},

 frequency:{type:String,enum:["weekly","biweekly","semimonthly","monthly","custom"],default:"biweekly"},
 status:{type:String,enum:["draft","open","locked","processed","paid","closed","void"],default:"draft",index:true},

 processedAt:{type:Date,default:null},
 processedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 paidAt:{type:Date,default:null},
 paidBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"payroll_periods"});

payrollPeriodSchema.index({business:1,startDate:1,endDate:1},{unique:true});
payrollPeriodSchema.index({business:1,status:1,payDate:1});
payrollPeriodSchema.index({business:1,frequency:1,status:1});

const PayrollPeriod=mongoose.models.PayrollPeriod||mongoose.model("PayrollPeriod",payrollPeriodSchema);

export default PayrollPeriod;