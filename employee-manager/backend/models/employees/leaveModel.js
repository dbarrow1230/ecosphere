// backend/models/employees/leaveModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const leaveSchema=new mongoose.Schema({
 employeeRef:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},
 leaveType:{type:String,trim:true,required:true},
 paid:{type:Boolean,default:true},
 earningsRate:{type:Number,default:0},
 annualMaxHours:{type:Number,default:0},
 usedHours:{type:Number,default:0},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"employee_leave"});

const Leave=businessInfoConnection.models.Leave||businessInfoConnection.model("Leave",leaveSchema);

export default Leave;
