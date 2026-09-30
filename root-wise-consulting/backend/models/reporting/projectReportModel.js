//backend\models\reporting\projectReportModel.js
import mongoose from "mongoose";

const projectMetricSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 value:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const projectReportSchema=new mongoose.Schema({
 report:{type:mongoose.Schema.Types.ObjectId,ref:"Report",default:null},
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},

 reportDate:{type:Date,default:Date.now},
 projectStage:{type:String,trim:true,default:""},
 projectStatus:{type:String,trim:true,default:""},

 problemSummary:{type:String,trim:true,default:""},
 workCompleted:[{type:String,trim:true}],
 workInProgress:[{type:String,trim:true}],
 blockers:[{type:String,trim:true}],
 recommendations:[{type:String,trim:true}],
 nextSteps:[{type:String,trim:true}],
 metrics:[projectMetricSchema],

 summary:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"project_reports"});

projectReportSchema.index({report:1});
projectReportSchema.index({clientBusiness:1});
projectReportSchema.index({project:1});
projectReportSchema.index({reportDate:1});
projectReportSchema.index({isActive:1});

export default mongoose.models.ProjectReport||mongoose.model("ProjectReport",projectReportSchema);