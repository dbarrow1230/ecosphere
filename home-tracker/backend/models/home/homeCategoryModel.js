import mongoose from "mongoose";

const homeCategorySchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 name:{type:String,required:true,trim:true},
 type:{type:String,enum:["all","pantry","fridge","freezer","household"],default:"all"},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"home_categories"});

homeCategorySchema.index({business:1,name:1},{unique:true});
homeCategorySchema.index({type:1,isActive:1});

const HomeCategory=mongoose.models.HomeCategory||mongoose.model("HomeCategory",homeCategorySchema);

export default HomeCategory;
