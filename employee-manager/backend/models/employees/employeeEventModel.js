// backend/models/employees/employeeEventModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const employeeEventSchema=new mongoose.Schema({
 eventName:{type:String,trim:true,required:true},
 eventType:{type:String,trim:true,required:true,index:true},
 employeeRef:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null,index:true},
 createdOn:{type:Date,default:Date.now},
 recurring:{type:Boolean,default:false},
 reminder:{type:Boolean,default:false,index:true},
 reminderDate:{type:Date,default:null,index:true},
 lastReminderSentAt:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"employee_events"});

const EmployeeEvent=businessInfoConnection.models.EmployeeEvent||businessInfoConnection.model("EmployeeEvent",employeeEventSchema);

export default EmployeeEvent;
