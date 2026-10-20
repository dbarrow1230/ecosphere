// backend/models/master/CategoryModel.js
import mongoose from "mongoose";

const {Schema}=mongoose;

const CategorySchema=new Schema({
 name:{type:String,required:true,trim:true,unique:true,index:true},
 slug:{type:String,trim:true,unique:true,index:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"categories"});

export default mongoose.models.Category||mongoose.model("Category",CategorySchema);