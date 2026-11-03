// backend/models/payroll/payStubModel.js
import mongoose from "mongoose";

const earningSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 hours:{type:Number,default:0,min:0},
 rate:{type:Number,default:0,min:0},
 amount:{type:Number,default:0,min:0}
},{_id:false});

const deductionSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 amount:{type:Number,default:0,min:0}
},{_id:false});

const taxSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 amount:{type:Number,default:0,min:0}
},{_id:false});

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const payStubSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},
 payroll:{type:mongoose.Schema.Types.ObjectId,ref:"Payroll",required:true,index:true},
 payrollPeriod:{type:mongoose.Schema.Types.ObjectId,ref:"PayrollPeriod",default:null,index:true},

 payDate:{type:Date,default:null,index:true},

 earnings:{type:[earningSchema],default:[]},
 deductions:{type:[deductionSchema],default:[]},
 taxes:{type:[taxSchema],default:[]},

 grossPay:{type:Number,default:0,min:0},
 totalDeductions:{type:Number,default:0,min:0},
 totalTaxes:{type:Number,default:0,min:0},
 netPay:{type:Number,default:0,min:0},

 status:{type:String,enum:["draft","issued","void"],default:"draft",index:true},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"payStubs"});

payStubSchema.index({business:1,employee:1,payroll:1},{unique:true});
payStubSchema.index({business:1,payDate:1,status:1});
payStubSchema.index({business:1,payrollPeriod:1,employee:1});

const PayStub=mongoose.models.PayStub||mongoose.model("PayStub",payStubSchema);

export default PayStub;