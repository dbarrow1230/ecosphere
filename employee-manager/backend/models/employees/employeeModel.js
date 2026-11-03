// backend/models/employees/employeeModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const employeeSchema=new mongoose.Schema({
 employeeNumber:{type:String,trim:true,required:true,unique:true,index:true},
 firstName:{type:String,trim:true,required:true},
 lastName:{type:String,trim:true,required:true},
 gender:{type:String,trim:true,default:""},
 status:{type:String,enum:["Active","Inactive","Archived"],default:"Active",index:true},
 position:{type:String,trim:true,default:""},
 payType:{type:String,enum:["Hourly","Salary"],default:"Hourly"},
 hourlyRate:{type:Number,default:0},
 salaryAmount:{type:Number,default:0},
 email:{type:String,trim:true,lowercase:true,default:""},
 phone:{type:String,trim:true,default:""},
 startDate:{type:Date,default:null},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"employees"});

employeeSchema.index({lastName:1,firstName:1});

const Employee=businessInfoConnection.models.Employee||businessInfoConnection.model("Employee",employeeSchema);

export default Employee;
