import mongoose from "mongoose";

const menteeResourceModel=new mongoose.Schema({
 mentee:{type:mongoose.Schema.Types.ObjectId,ref:"Mentee",required:true},
 resource:{type:mongoose.Schema.Types.ObjectId,ref:"Resource",required:true},
 resourceLink:{type:mongoose.Schema.Types.ObjectId,required:false,default:null},
 givenDate:{type:Date,required:true,default:Date.now},
 notes:{type:String,trim:true,default:""},
 followUpNeeded:{type:Boolean,default:false},
 followUpDate:{type:Date,default:null},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"menteeResources"});

menteeResourceModel.index({mentee:1,resource:1,resourceLink:1},{unique:true});
menteeResourceModel.index({givenDate:-1});

export default mongoose.model("MenteeResource",menteeResourceModel);
