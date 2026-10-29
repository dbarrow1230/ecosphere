import mongoose from "mongoose";

const inquirySchema=new mongoose.Schema({name:{type:String,required:true,maxlength:120},email:{type:String,required:true,maxlength:254},message:{type:String,required:true,maxlength:2000},status:{type:String,enum:["new","reviewed"],default:"new"}},{timestamps:true});
export default mongoose.model("BatsInquiry",inquirySchema);
