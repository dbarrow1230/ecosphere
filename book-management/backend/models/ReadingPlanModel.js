import mongoose from "mongoose";

const ReadingPlanModelSchema=new mongoose.Schema({
 name:{type:String,trim:true,required:true},
 book:{type:mongoose.Schema.Types.ObjectId,ref:"Book",required:true,index:true},
 subject:{type:String,trim:true,default:"General",index:true},
 daysOfWeek:[{type:String,trim:true,enum:["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]}],
 startDate:{type:Date,default:null,index:true},
 endDate:{type:Date,default:null,index:true},
 startPage:{type:Number,min:0,default:0},
 targetPage:{type:Number,min:0,default:0},
 pagesPerSession:{type:Number,min:0,default:0},
 status:{type:String,trim:true,enum:["active","paused","completed","archived"],default:"active",index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"reading_plans"});

ReadingPlanModelSchema.index({status:1,subject:1});

const ReadingPlanModel=mongoose.models.ReadingPlan||mongoose.model("ReadingPlan",ReadingPlanModelSchema);

export default ReadingPlanModel;
