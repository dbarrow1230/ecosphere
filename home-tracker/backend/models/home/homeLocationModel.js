import mongoose from "mongoose";

const homeLocationSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 name:{type:String,required:true,trim:true},
 type:{type:String,enum:["pantry","fridge","freezer","cabinet","closet","room","garage","bathroom","laundry","other"],default:"other"},
 description:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"home_locations"});

homeLocationSchema.index({business:1,name:1},{unique:true});
homeLocationSchema.index({type:1,isActive:1});

const HomeLocation=mongoose.models.HomeLocation||mongoose.model("HomeLocation",homeLocationSchema);

export default HomeLocation;
