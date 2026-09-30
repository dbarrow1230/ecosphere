//bakckend/models/payroll/payrollModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const payrollTimeEntrySchema=new mongoose.Schema({
 timeEntry:{type:mongoose.Schema.Types.ObjectId,ref:"TimeEntry",required:true,index:true},
 workDate:{type:Date,default:null},
 regularWorkedMinutes:{type:Number,default:0,min:0},
 overtimeMinutes:{type:Number,default:0,min:0},
 approvedOvertimeMinutes:{type:Number,default:0,min:0},
 totalWorkedMinutes:{type:Number,default:0,min:0},
 hourlyRate:{type:Number,default:0,min:0},
 overtimeRate:{type:Number,default:0,min:0},
 regularPay:{type:Number,default:0,min:0},
 overtimePay:{type:Number,default:0,min:0},
 grossPay:{type:Number,default:0,min:0}
},{_id:false});

const payrollSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},

 payPeriodStart:{type:Date,required:true,index:true},
 payPeriodEnd:{type:Date,required:true,index:true},
 payDate:{type:Date,default:null},

 timeEntries:{type:[payrollTimeEntrySchema],default:[]},

 totalRegularMinutes:{type:Number,default:0,min:0},
 totalOvertimeMinutes:{type:Number,default:0,min:0},
 totalApprovedOvertimeMinutes:{type:Number,default:0,min:0},
 totalWorkedMinutes:{type:Number,default:0,min:0},

 hourlyRate:{type:Number,default:0,min:0},
 overtimeRate:{type:Number,default:0,min:0},

 regularPay:{type:Number,default:0,min:0},
 overtimePay:{type:Number,default:0,min:0},
 grossPay:{type:Number,default:0,min:0},

 status:{type:String,enum:["draft","processed","paid","void"],default:"draft"},

 processedAt:{type:Date,default:null},
 processedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"payrolls"});

payrollSchema.index({business:1,employee:1,payPeriodStart:1,payPeriodEnd:1},{unique:true});
payrollSchema.index({business:1,status:1,payDate:1});
payrollSchema.index({business:1,employee:1,status:1});

const Payroll=mongoose.models.Payroll||mongoose.model("Payroll",payrollSchema);

export default Payroll;