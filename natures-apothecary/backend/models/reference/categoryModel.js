// backend/models/categoryModel.js
import mongoose from "mongoose";

const categorySchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true},
 slug:{type:String,trim:true,lowercase:true,unique:true,sparse:true},
 description:{type:String,trim:true,default:""},
 image:{type:String,trim:true,default:""},
 status:{type:String,enum:["active","inactive","archived"],default:"active",lowercase:true,trim:true}
},{timestamps:true,collection:"categories"});

categorySchema.index({status:1});

export default mongoose.models.Category||mongoose.model("Category",categorySchema);