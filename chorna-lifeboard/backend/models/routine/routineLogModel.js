import mongoose from "mongoose";

const routineStepLogSchema=new mongoose.Schema({
 title:{type:String,default:""},
 completed:{type:Boolean,default:false},
 notes:{type:String,default:""}
},{_id:false});

const routineLogSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 routine:{type:mongoose.Schema.Types.ObjectId,ref:"Routine",required:true},
 logDate:{type:Date,required:true},
 completed:{type:Boolean,default:false},
 completedAt:{type:Date},
 steps:[routineStepLogSchema],
 mood:{type:String,default:""},
 energy:{type:Number,min:1,max:10},
 notes:{type:String,default:""}
},{ timestamps:true, collection:"routine_logs"});

routineLogSchema.index({user:1,routine:1,logDate:1},{unique:true});
routineLogSchema.index({user:1,logDate:-1});

const RoutineLog=mongoose.model("RoutineLog",routineLogSchema);

export default RoutineLog;