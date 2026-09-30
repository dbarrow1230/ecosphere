// backend/models/users/userDetailsModel.js
import mongoose from "mongoose";

const userDetailsSchema=new mongoose.Schema(
{
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,unique:true},
 firstName:{type:String,trim:true,default:""},
 lastName:{type:String,trim:true,default:""},
 phone:{type:String,trim:true,default:""},
 cell:{type:String,trim:true,default:""},
 address1:{type:String,trim:true,default:""},
 address2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null},
 county:{type:mongoose.Schema.Types.ObjectId,ref:"County",default:null},
 postalCode:{type:String,trim:true,default:""},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null},
 avatar:{type:String,trim:true,default:""},
 notes:[{type:String,trim:true}]
},
{timestamps:true,collection:"user_details"}
);

const UserDetails=mongoose.models.UserDetails||mongoose.model("UserDetails",userDetailsSchema);

export default UserDetails;