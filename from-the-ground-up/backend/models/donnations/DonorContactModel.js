// backend/models/donnations/DonationModel.js
import mongoose from "mongoose";

const donorContactSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 email:{type:String,required:true,trim:true,lowercase:true,unique:true},
 phone:{type:String,trim:true},
 company:{type:String,trim:true},
 address1:{type:String,trim:true},
 address2:{type:String,trim:true},
 city:{type:String,trim:true},

 state:{type:mongoose.Schema.Types.ObjectId,ref:"State"},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country"},

 postalCode:{type:String,trim:true},
 mailingOptIn:{type:Boolean,default:false}
},{timestamps:true,collection:"donor_contacts"});

const DonorContact=mongoose.model("DonorContact",donorContactSchema);

export default DonorContact;