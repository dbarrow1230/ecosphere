import mongoose from "mongoose";

const userDetailsSchema=new mongoose.Schema(
{
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,unique:true},
 firstName:{type:String,trim:true},
 lastName:{type:String,trim:true},
 phone:{type:String,trim:true},
 cell:{type:String,trim:true},
 address1:{type:String,trim:true},
 address2:{type:String,trim:true},
 city:{type:String,trim:true},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State"},
 county:{type:mongoose.Schema.Types.ObjectId,ref:"County"},
 postalCode:{type:String,trim:true},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country"},
 avatar:{type:String,trim:true},
 notes:[{type:String,trim:true}]
},
{timestamps:true,collection:"user_details"}
);

const UserDetails=mongoose.model("UserDetails",userDetailsSchema);

export default UserDetails;
