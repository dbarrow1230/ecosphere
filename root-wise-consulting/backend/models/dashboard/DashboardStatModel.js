//backend/models/dashboard/DashboardStatModel.js
import mongoose from "mongoose";

const dashboardStatSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 key:{type:String,required:true,trim:true},
 label:{type:String,trim:true,default:""},

 value:{type:Number,default:0},
 unit:{type:String,trim:true,default:""},

 period:{type:String,enum:["daily","weekly","monthly","yearly","all"],default:"all"},

 recordedAt:{type:Date,default:Date.now},

 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true}

},{timestamps:true,collection:"dashboard_stats"});

dashboardStatSchema.index({user:1});
dashboardStatSchema.index({key:1});
dashboardStatSchema.index({period:1});
dashboardStatSchema.index({recordedAt:1});
dashboardStatSchema.index({isActive:1});

const DashboardStat=mongoose.models.DashboardStat||mongoose.model("DashboardStat",dashboardStatSchema);

export default DashboardStat;