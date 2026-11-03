// backend/models/emergencyContactModel.js
import mongoose from "mongoose";

const emergencyContactSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},
 name:{type:String,trim:true,default:""},
 relationship:{type:String,trim:true,default:""},
 phone:{type:String,trim:true,default:""},
 email:{type:String,trim:true,lowercase:true,default:""},
 address:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 isPrimary:{type:Boolean,default:true},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"emergency_contacts"});

emergencyContactSchema.index({business:1,employee:1});
emergencyContactSchema.index({business:1,employee:1,isPrimary:1});

const EmergencyContact=mongoose.models.EmergencyContact||mongoose.model("EmergencyContact",emergencyContactSchema);

export default EmergencyContact;