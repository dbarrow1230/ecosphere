import mongoose from "mongoose";

const blogCategorySchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true},
 slug:{type:String,required:true,trim:true,lowercase:true,unique:true},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"blogCategories"});

export default mongoose.model("BlogCategory",blogCategorySchema);
