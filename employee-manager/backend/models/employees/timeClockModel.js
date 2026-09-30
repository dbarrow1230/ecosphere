import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const auditEntrySchema=new mongoose.Schema({
 action:{type:String,trim:true,required:true},
 userName:{type:String,trim:true,default:"System"},
 changedAt:{type:Date,default:Date.now},
 note:{type:String,trim:true,default:""}
},{_id:false});

const timeClockSchema=new mongoose.Schema({
 employeeRef:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},
 workDate:{type:Date,required:true,index:true},
 clockIn:{type:String,trim:true,default:""},
 breakOut:{type:String,trim:true,default:""},
 breakIn:{type:String,trim:true,default:""},
 clockOut:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 method:{type:String,enum:["Time Clock","Manual","Remote","Admin Edit"],default:"Manual",index:true},
 auditTrail:{type:[auditEntrySchema],default:[]}
},{timestamps:true,collection:"time_clock_entries"});

timeClockSchema.index({employeeRef:1,workDate:1});

const TimeClock=businessInfoConnection.models.TimeClock||businessInfoConnection.model("TimeClock",timeClockSchema);

export default TimeClock;
