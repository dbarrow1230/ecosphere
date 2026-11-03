import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const range=new mongoose.Schema({start:{type:String,required:true},end:{type:String,required:true}},{_id:false});
const day=new mongoose.Schema({dayOfWeek:{type:Number,min:0,max:6,required:true},isAvailable:{type:Boolean,default:false},ranges:{type:[range],default:[]}},{_id:false});
const override=new mongoose.Schema({date:{type:Date,required:true},isAvailable:{type:Boolean,default:false},ranges:{type:[range],default:[]},note:{type:String,default:""}},{_id:false});
const schema=new mongoose.Schema({
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,unique:true,index:true},
 weekly:{type:[day],default:[]},overrides:{type:[override],default:[]}
},{timestamps:true,collection:"employee_availability"});
export default businessInfoConnection.models.EmployeeAvailability||businessInfoConnection.model("EmployeeAvailability",schema);
