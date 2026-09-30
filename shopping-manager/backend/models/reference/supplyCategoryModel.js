// backend/models/reference/supplyCategoryModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const supplyCategorySchema=new Schema({
name:{type:String,required:true,trim:true},
description:String,
parentCategory:{type:Schema.Types.ObjectId,ref:"SupplyCategory",default:null},
createdBy:{type:Schema.Types.ObjectId,ref:"User"}
},{timestamps:true,collection:"supply_categories"});

export default model("SupplyCategory",supplyCategorySchema);