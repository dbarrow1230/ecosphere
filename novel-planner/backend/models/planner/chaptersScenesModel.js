//backend/models/planner/chaptersScenesModel.js
import mongoose from "mongoose";

const chapterListEntrySchema=new mongoose.Schema({
 chapterNumber:{type:String,trim:true,default:""},
 chapterTitle:{type:String,trim:true,default:""},
 summaryOfKeyEvents:{type:String,trim:true,default:""},
 povMainCharacters:{type:String,trim:true,default:""},
 wordCount:{type:Number,default:0}
},{_id:true});

const chapterListSchema=new mongoose.Schema({
 chapters:{type:[chapterListEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const chapterDashboardSchema=new mongoose.Schema({
 chapterNumberTitle:{type:String,trim:true,default:""},
 dateWritten:{type:Date,default:null},
 wordCount:{type:Number,default:0},
 chapterGoalPurpose:{type:String,trim:true,default:""},
 keyPlotPoints:{type:[String],default:[]},
 charactersInvolved:{type:[String],default:[]},
 keyDialogueEvents:{type:[String],default:[]},
 internalConflictsArcs:{type:[String],default:[]},
 settings:{type:[String],default:[]},
 notes:{type:[String],default:[]}
},{_id:true});

const chapterSummaryEntrySchema=new mongoose.Schema({
 chapterName:{type:String,trim:true,default:""},
 summary:{type:String,trim:true,default:""}
},{_id:true});

const chapterSummarySchema=new mongoose.Schema({
 chapters:{type:[chapterSummaryEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const sceneDashboardEntrySchema=new mongoose.Schema({
 scene:{type:String,trim:true,default:""},
 belongsToChapter:{type:String,trim:true,default:""},
 settingLocation:{type:String,trim:true,default:""},
 charactersInvolved:{type:[String],default:[]},
 keyActionsSummary:{type:[String],default:[]},
 emotionalImpact:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{_id:true});

const sceneDashboardSchema=new mongoose.Schema({
 scenes:{type:[sceneDashboardEntrySchema],default:[]},
 notes:{type:[String],default:[]}
},{_id:false});

const chaptersScenesSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 user_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"},
 book_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Book"},

 chapterList:{type:chapterListSchema,default:()=>({})},
 chapterDashboards:{type:[chapterDashboardSchema],default:[]},
 chapterSummary:{type:chapterSummarySchema,default:()=>({})},
 sceneDashboard:{type:sceneDashboardSchema,default:()=>({})},

 notes:{type:[String],default:[]},
 isActive:{type:Boolean,default:true,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true}
},{timestamps:true,collection:"chapters_scenes"});

chaptersScenesSchema.index({business_id:1,user_id:1,book_id:1},{unique:true});
chaptersScenesSchema.index({business_id:1,user_id:1,isActive:1});

const ChaptersScenes=mongoose.models.ChaptersScenes||mongoose.model("ChaptersScenes",chaptersScenesSchema);

export default ChaptersScenes;