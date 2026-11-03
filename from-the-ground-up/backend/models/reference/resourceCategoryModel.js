// backend/models/reference/resourceCategoryModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const resourceCategorySchema=new Schema({
name:{type:String,required:true,trim:true},
description:{type:String,trim:true,default:""},
parentCategory:{type:Schema.Types.ObjectId,ref:"ResourceCategory",default:null},
order:{type:Number,default:0},
isActive:{type:Boolean,default:true},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"resource_categories"});

const ResourceCategory=mongoose.models.ResourceCategory||mongoose.model("ResourceCategory",resourceCategorySchema);

export default ResourceCategory;