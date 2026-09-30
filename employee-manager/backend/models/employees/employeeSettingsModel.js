import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const employeeSettingsSchema=new mongoose.Schema({
 settingsKey:{type:String,default:"default",unique:true,index:true},
 companyName:{type:String,trim:true,default:""},
 address:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 region:{type:String,trim:true,default:""},
 country:{type:String,trim:true,default:""},
 payFrequency:{type:String,trim:true,default:"Bi-Weekly"},
 payrollStart:{type:Date,default:null},
 workweekStartsOn:{type:String,trim:true,default:"Monday"},
 startTime:{type:String,trim:true,default:"07:00"},
 endTime:{type:String,trim:true,default:"18:00"},
 dailyOvertimeAfter:{type:Number,default:8},
 weeklyOvertimeAfter:{type:Number,default:40},
 timeFormat:{type:String,trim:true,default:"Time Format (2:30)"}
},{timestamps:true,collection:"employee_settings"});

const EmployeeSettings=businessInfoConnection.models.EmployeeSettings||businessInfoConnection.model("EmployeeSettings",employeeSettingsSchema);

export default EmployeeSettings;
