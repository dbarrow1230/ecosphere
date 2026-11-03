import coreConnection from "../../db/coreConnection.js";
import mongoose from "mongoose";

const emergencyContactSchema=new mongoose.Schema(
{
 name:{type:String,trim:true,required:true},
 phone:{type:String,trim:true},
 relationship:{type:String,trim:true}
},
{_id:true}
);

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
 notes:[{type:String,trim:true}],
 emergencyContacts:{type:[emergencyContactSchema],default:[]}
},
{timestamps:true,collection:"user_details"}
);

const UserDetails=coreConnection.models.UserDetails||coreConnection.model("UserDetails",userDetailsSchema);

export default UserDetails;
