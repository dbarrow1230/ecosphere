// backend/models/employees/weeklyScheduleModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const dayScheduleSchema=new mongoose.Schema({
 workday:{type:Boolean,default:true},
 startTime:{type:String,trim:true,default:"07:00"},
 breakStart:{type:String,trim:true,default:"12:00"},
 breakEnd:{type:String,trim:true,default:"12:30"},
 endTime:{type:String,trim:true,default:"18:00"}
},{_id:false});

const weeklyScheduleSchema=new mongoose.Schema({
 employeeRef:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},
 monday:{type:dayScheduleSchema,default:{}},
 tuesday:{type:dayScheduleSchema,default:{}},
 wednesday:{type:dayScheduleSchema,default:{}},
 thursday:{type:dayScheduleSchema,default:{}},
 friday:{type:dayScheduleSchema,default:{}},
 saturday:{type:dayScheduleSchema,default:{workday:false}},
 sunday:{type:dayScheduleSchema,default:{workday:false}}
},{timestamps:true,collection:"employee_weekly_schedules"});

const WeeklySchedule=businessInfoConnection.models.WeeklySchedule||businessInfoConnection.model("WeeklySchedule",weeklyScheduleSchema);

export default WeeklySchedule;
