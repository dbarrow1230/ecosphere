// backend/models/reference/equipmentCategoryModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const equipmentCategorySchema=new Schema({
name:{type:String,required:true,trim:true},
description:String,
parentCategory:{type:Schema.Types.ObjectId,ref:"EquipmentCategory",default:null},
createdBy:{type:Schema.Types.ObjectId,ref:"User"}
},{timestamps:true,collection:"equipment_categories"});

export default model("EquipmentCategory",equipmentCategorySchema);