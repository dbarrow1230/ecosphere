import mongoose from "mongoose";

const goalSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 goalType:{type:String,enum:["daily","weekly","monthly","yearly","short-term","long-term"],default:"short-term"},
 status:{type:String,enum:["not-started","in-progress","completed","paused","cancelled","archived"],default:"not-started"},
 priority:{type:String,enum:["low","medium","high","urgent"],default:"medium"},
 startDate:{type:Date},
 targetDate:{type:Date},
 completedAt:{type:Date},
 progress:{type:Number,min:0,max:100,default:0},
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"goals"});

goalSchema.index({user:1,status:1,targetDate:1});
goalSchema.index({user:1,goalType:1});
goalSchema.index({user:1,lifeArea:1});

const Goal=mongoose.model("Goal",goalSchema);

export default Goal;