import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;
const ContactInquirySchema=new Schema({
 name:{type:String,required:true,trim:true},email:{type:String,required:true,trim:true,lowercase:true},
 subject:{type:String,required:true,trim:true},message:{type:String,required:true,trim:true},
 status:{type:String,enum:["new","reviewed","closed"],default:"new",index:true}
},{timestamps:true,collection:"contact_inquiries"});

export default businessInfoConnection.models.ContactInquiry||businessInfoConnection.model("ContactInquiry",ContactInquirySchema);
