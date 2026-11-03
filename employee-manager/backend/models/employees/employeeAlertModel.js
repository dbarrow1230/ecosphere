// backend/models/employees/employeeAlertModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const deliverySchema=new mongoose.Schema({
 inApp:{type:Boolean,default:false},
 email:{type:Boolean,default:false},
 sms:{type:Boolean,default:false},
 text:{type:Boolean,default:false}
},{_id:false});

const employeeAlertSchema=new mongoose.Schema({
 settingRef:{type:mongoose.Schema.Types.ObjectId,ref:"EmployeeNotificationSetting",default:null,index:true},
 eventRef:{type:mongoose.Schema.Types.ObjectId,ref:"EmployeeEvent",default:null,index:true},
 payrollRef:{type:mongoose.Schema.Types.ObjectId,ref:"Payroll",default:null,index:true},
 title:{type:String,trim:true,required:true},
 message:{type:String,trim:true,required:true},
 severity:{type:String,enum:["info","success","warning","danger"],default:"info"},
 status:{type:String,enum:["pending","sent","failed","read"],default:"sent",index:true},
 delivery:{type:deliverySchema,default:{}},
 sentAt:{type:Date,default:Date.now},
 readAt:{type:Date,default:null},
 error:{type:String,trim:true,default:""}
},{timestamps:true,collection:"employee_alerts"});

const EmployeeAlert=businessInfoConnection.models.EmployeeAlert||
 businessInfoConnection.model("EmployeeAlert",employeeAlertSchema);

export default EmployeeAlert;
