import mongoose from "mongoose";

const referenceSchema=new mongoose.Schema(
{
note:{type:mongoose.Schema.Types.ObjectId,ref:"Note",required:true},
source:{type:mongoose.Schema.Types.ObjectId,ref:"Source",required:true},
title:{type:String,required:true,trim:true},
chapter:{type:String,trim:true},
verse:{type:String,trim:true},
page:{type:String,trim:true},
description:{type:String,trim:true}
},
{timestamps:true,collection:"references"}
);

const Reference=mongoose.model("Reference",referenceSchema);

export default Reference;