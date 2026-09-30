// backend/models/countyModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const countySchema=new mongoose.Schema(
{
name:{type:String,required:true,trim:true},
code:{type:String,trim:true,uppercase:true},
state:{type:mongoose.Schema.Types.ObjectId,ref:"State",required:true},
country:{type:mongoose.Schema.Types.ObjectId,ref:"Country",required:true},
isActive:{type:Boolean,default:true}
},
{timestamps:true,collection:"counties"}
);

countySchema.index({name:1,state:1},{unique:true});

const County=businessInfoConnection.models.County||businessInfoConnection.model("County",countySchema);

export default County;