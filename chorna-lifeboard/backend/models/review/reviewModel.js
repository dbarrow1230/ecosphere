import mongoose from "mongoose";

const promptResponseSchema=new mongoose.Schema({
 prompt:{type:mongoose.Schema.Types.ObjectId,ref:"Prompt"},
 question:{type:String,default:""},
 answer:{type:String,default:""}
},{_id:false});

const reviewSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 reviewType:{type:String,enum:["daily","weekly","monthly","quarterly","yearly"],default:"weekly"},
 periodStart:{type:Date,required:true},
 periodEnd:{type:Date,required:true},
 summary:{type:String,default:""},
 wins:[{type:String,trim:true}],
 challenges:[{type:String,trim:true}],
 lessons:[{type:String,trim:true}],
 improvements:[{type:String,trim:true}],
 nextFocus:[{type:String,trim:true}],
 moodAverage:{type:Number,default:0},
 energyAverage:{type:Number,default:0},
 stressAverage:{type:Number,default:0},
 completedTasks:{type:Number,default:0},
 completedHabits:{type:Number,default:0},
 completedGoals:{type:Number,default:0},
 promptResponses:[promptResponseSchema],
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"reviews"});

reviewSchema.index({user:1,reviewType:1,periodStart:-1});
reviewSchema.index({user:1,periodEnd:-1});

const Review=mongoose.model("Review",reviewSchema);

export default Review;