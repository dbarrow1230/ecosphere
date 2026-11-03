// backend/models/smartGoalModel.js
import mongoose from "mongoose";

const smartGoalModel=new mongoose.Schema({
 mentee:{type:mongoose.Schema.Types.ObjectId,ref:"Mentee",required:true,index:true},
 weekNumber:{type:Number,required:true,min:1,max:6},
 specific:{type:String,trim:true,required:true},
 measurable:{type:String,trim:true},
 achievable:{type:String,trim:true},
 relevant:{type:String,trim:true},
 timeBound:{type:String,trim:true},
 progressPercent:{type:Number,default:0,min:0,max:100},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",default:null},
 targetDate:{type:Date,default:null},
 mentorComments:{type:String,trim:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"smart_goals"});

const SmartGoal=mongoose.model("SmartGoal",smartGoalModel);

export default SmartGoal;