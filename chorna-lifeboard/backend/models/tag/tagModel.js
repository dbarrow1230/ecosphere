import mongoose from "mongoose";

const tagSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 name:{type:String,required:true,trim:true},
 color:{type:String,default:""},
 icon:{type:String,default:""},
 isActive:{type:Boolean,default:true}
},{ timestamps:true, collection:"tags"});

tagSchema.index({user:1,name:1},{unique:true});

const Tag=mongoose.model("Tag",tagSchema);

export default Tag;