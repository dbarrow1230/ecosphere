import mongoose from "mongoose";

const habitLogSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 habit:{type:mongoose.Schema.Types.ObjectId,ref:"Habit",required:true},
 logDate:{type:Date,required:true},
 completed:{type:Boolean,default:false},
 count:{type:Number,default:0},
 mood:{type:String,default:""},
 notes:{type:String,default:""}
},{ timestamps:true, collection:"habit_logs"});

habitLogSchema.index({user:1,habit:1,logDate:1},{unique:true});
habitLogSchema.index({user:1,logDate:-1});

const HabitLog=mongoose.model("HabitLog",habitLogSchema);

export default HabitLog;