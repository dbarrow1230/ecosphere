import mongoose from "mongoose";

const musicProjectSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 title:{type:String,trim:true,required:true},
 description:{type:String,trim:true,default:""},
 status:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 tags:{type:[String],default:[]},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"music_projects"});

musicProjectSchema.index({userId:1,title:1});
musicProjectSchema.index({userId:1,isActive:1});

const MusicProject=mongoose.models.MusicProject||mongoose.model("MusicProject",musicProjectSchema);

export default MusicProject;
