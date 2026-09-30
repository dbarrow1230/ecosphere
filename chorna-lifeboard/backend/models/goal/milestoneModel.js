import mongoose from "mongoose";

const milestoneSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 milestoneDate:{type:Date,required:true},
 milestoneType:{type:String,enum:["goal","personal","career","health","creative","financial","relationship","education","spiritual","other"],default:"personal"},
 linkedGoal:{type:mongoose.Schema.Types.ObjectId,ref:"Goal"},
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"milestones"});

milestoneSchema.index({user:1,milestoneDate:-1});
milestoneSchema.index({user:1,linkedGoal:1});

const Milestone=mongoose.model("Milestone",milestoneSchema);

export default Milestone;