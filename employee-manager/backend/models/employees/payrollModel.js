// backend/models/employees/payrollModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const payrollSchema=new mongoose.Schema({
 payrollName:{type:String,trim:true,required:true,index:true},
 fromDate:{type:Date,required:true},
 toDate:{type:Date,required:true},
 status:{type:String,enum:["Draft","Closed"],default:"Draft",index:true},
 payFrequency:{type:String,trim:true,default:"Bi-Weekly"},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"payrolls"});

const Payroll=businessInfoConnection.models.Payroll||businessInfoConnection.model("Payroll",payrollSchema);

export default Payroll;
