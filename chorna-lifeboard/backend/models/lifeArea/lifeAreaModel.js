import mongoose from "mongoose";

const lifeAreaSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 name:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 color:{type:String,default:""},
 icon:{type:String,default:""},
 sortOrder:{type:Number,default:0},
 isActive:{type:Boolean,default:true}
},{ timestamps:true, collection:"life_areas"});

lifeAreaSchema.index({user:1,name:1},{unique:true});

const LifeArea=mongoose.model("LifeArea",lifeAreaSchema);

export default LifeArea;