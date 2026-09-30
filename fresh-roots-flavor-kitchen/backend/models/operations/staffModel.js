import mongoose from "mongoose";

const staffSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 role:{type:String,required:true,trim:true},
 shift:{type:String,trim:true,default:""},
 status:{type:String,enum:["On Duty","On Break","Off Duty"],default:"Off Duty",index:true},
 area:{type:String,enum:["boh","foh"],default:"boh",index:true},
 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"staff"});

const Staff=mongoose.models.Staff||mongoose.model("Staff",staffSchema);
export default Staff;
