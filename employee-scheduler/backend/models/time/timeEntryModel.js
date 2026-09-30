// backend/models/time/timeEntryModel.js
import mongoose from "mongoose";

const actionSchema=new mongoose.Schema({
 type:{type:String,enum:[
  "clock-in",
  "clock-out",
  "break-start",
  "break-end",
  "lunch-start",
  "lunch-end"
 ],required:true},
 timestamp:{type:Date,default:Date.now},
 method:{type:String,enum:["kiosk","mobile","manual"],default:"kiosk"},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 note:{type:String,trim:true,default:""}
},{_id:false});

const breakSchema=new mongoose.Schema({
 start:{type:Date,default:null},
 end:{type:Date,default:null},
 type:{type:String,enum:["break","lunch"],default:"break"},
 durationMinutes:{type:Number,default:0,min:0},
 paid:{type:Boolean,default:false}
},{_id:false});

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const timeEntrySchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},
 shift:{type:mongoose.Schema.Types.ObjectId,ref:"Shift",default:null,index:true},

 shiftLocation:{type:mongoose.Schema.Types.ObjectId,ref:"ShiftLocation",default:null,index:true},

 workDate:{type:Date,required:true,index:true},

 scheduledStart:{type:Date,default:null},
 scheduledEnd:{type:Date,default:null},
 scheduledMinutes:{type:Number,default:0,min:0},

 clockIn:{type:Date,default:null},
 clockOut:{type:Date,default:null},

 breaks:{type:[breakSchema],default:[]},

 totalBreakMinutes:{type:Number,default:0,min:0},
 totalPaidBreakMinutes:{type:Number,default:0,min:0},
 totalUnpaidBreakMinutes:{type:Number,default:0,min:0},

 totalWorkedMinutes:{type:Number,default:0,min:0},
 regularWorkedMinutes:{type:Number,default:0,min:0},
 overtimeMinutes:{type:Number,default:0,min:0},

 earlyInMinutes:{type:Number,default:0,min:0},
 lateInMinutes:{type:Number,default:0,min:0},
 earlyOutMinutes:{type:Number,default:0,min:0},
 lateOutMinutes:{type:Number,default:0,min:0},

 overtimeStatus:{type:String,enum:["none","unapproved","approved","rejected"],default:"none"},
 approvedOvertimeMinutes:{type:Number,default:0,min:0},
 overtimeApprovedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 overtimeApprovedAt:{type:Date,default:null},

 payroll:{type:mongoose.Schema.Types.ObjectId,ref:"Payroll",default:null,index:true},
 payrollStatus:{type:String,enum:["unprocessed","processed","paid","void"],default:"unprocessed",index:true},
 payrollProcessedAt:{type:Date,default:null},
 payrollProcessedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 hourlyRateSnapshot:{type:Number,default:0,min:0},
 overtimeRateSnapshot:{type:Number,default:0,min:0},
 regularPayAmount:{type:Number,default:0,min:0},
 overtimePayAmount:{type:Number,default:0,min:0},
 grossPayAmount:{type:Number,default:0,min:0},

 status:{type:String,enum:["active","on-break","completed","edited","missed-clock-out"],default:"active"},

 notes:{type:[noteSchema],default:[]},
 actions:{type:[actionSchema],default:[]}
},{timestamps:true,collection:"time_entries"});

timeEntrySchema.index({business:1,employee:1,workDate:1});
timeEntrySchema.index({business:1,employee:1,status:1});
timeEntrySchema.index({business:1,shift:1});
timeEntrySchema.index({business:1,shiftLocation:1,workDate:1});
timeEntrySchema.index({business:1,payroll:1});
timeEntrySchema.index({business:1,payrollStatus:1,workDate:1});

const TimeEntry=mongoose.models.TimeEntry||mongoose.model("TimeEntry",timeEntrySchema);

export default TimeEntry;