// backend/models/employees/attachmentModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const attachmentSchema=new mongoose.Schema({
 employeeRef:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null,index:true},
 fileName:{type:String,trim:true,required:true},
 fileType:{type:String,trim:true,default:"Document"},
 fileUrl:{type:String,trim:true,default:""},
 addedBy:{type:String,trim:true,default:""},
 addedOn:{type:Date,default:Date.now}
},{timestamps:true,collection:"employee_attachments"});

const Attachment=businessInfoConnection.models.Attachment||businessInfoConnection.model("Attachment",attachmentSchema);

export default Attachment;
