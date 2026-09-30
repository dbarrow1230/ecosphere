//backend/models/relationModel.js
import mongoose from "mongoose";

const relationTypeSchema=new mongoose.Schema(
{
name:{type:String,required:true,trim:true,unique:true},
description:{type:String,trim:true}
},
{timestamps:true,collection:"relation_types"}
);

const RelationType=mongoose.model("RelationType",relationTypeSchema);

export default RelationType;