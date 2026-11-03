import mongoose from "mongoose";

const ReadingGoalModelSchema=new mongoose.Schema({
 name:{type:String,trim:true,default:"Reading Goal"},
 period:{type:String,trim:true,enum:["monthly","yearly"],default:"monthly",index:true},
 year:{type:Number,required:true,index:true},
 month:{type:Number,min:1,max:12,default:null,index:true},
 targetBooks:{type:Number,min:0,default:0},
 targetPages:{type:Number,min:0,default:0},
 booksCompleted:{type:Number,min:0,default:0},
 pagesRead:{type:Number,min:0,default:0},
 status:{type:String,trim:true,enum:["active","paused","completed","archived"],default:"active",index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"reading_goals"});

ReadingGoalModelSchema.index({period:1,year:1,month:1,status:1});

const ReadingGoalModel=mongoose.models.ReadingGoal||mongoose.model("ReadingGoal",ReadingGoalModelSchema);

export default ReadingGoalModel;
