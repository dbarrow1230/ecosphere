import mongoose from "mongoose";

const categorySchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 name:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 categoryType:{type:String,enum:["task","goal","habit","journal","note","mindfulness","milestone","timeline","general"],default:"general"},
 color:{type:String,default:""},
 icon:{type:String,default:""},
 isActive:{type:Boolean,default:true}
},{ timestamps:true, collection:"categories"});

categorySchema.index({user:1,name:1,categoryType:1});

const Category=mongoose.model("Category",categorySchema);

export default Category;