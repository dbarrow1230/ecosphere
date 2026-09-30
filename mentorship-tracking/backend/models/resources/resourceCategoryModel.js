// backend/models/resources/resourceCategoryModel.js
import mongoose from "mongoose";

const resourceCategoryModel=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true},
 description:{type:String,trim:true,default:""},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 status:{type:String,trim:true,default:"active",enum:["active","archived"]},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"resource_categories"});

resourceCategoryModel.index({status:1});

const ResourceCategory=mongoose.model("ResourceCategory",resourceCategoryModel);

export default ResourceCategory;