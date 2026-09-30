// backend/models/employees/employeeNotificationSettingModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const notificationChannelsSchema=new mongoose.Schema({
 inApp:{type:Boolean,default:true},
 email:{type:Boolean,default:false},
 sms:{type:Boolean,default:false},
 text:{type:Boolean,default:false}
},{_id:false});

const notificationRecipientsSchema=new mongoose.Schema({
 userRefs:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
 emails:[{type:String,trim:true,lowercase:true}],
 phoneNumbers:[{type:String,trim:true}]
},{_id:false});

const employeeNotificationSettingSchema=new mongoose.Schema({
 settingKey:{type:String,trim:true,required:true,unique:true,index:true},
 name:{type:String,trim:true,required:true},
 description:{type:String,trim:true,default:""},
 eventType:{type:String,trim:true,required:true,index:true},
 cronExpression:{type:String,trim:true,default:"* * * * *"},
 channels:{type:notificationChannelsSchema,default:{}},
 recipients:{type:notificationRecipientsSchema,default:{}},
 enabled:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"employee_notification_settings"});

const EmployeeNotificationSetting=businessInfoConnection.models.EmployeeNotificationSetting||
 businessInfoConnection.model("EmployeeNotificationSetting",employeeNotificationSettingSchema);

export default EmployeeNotificationSetting;
