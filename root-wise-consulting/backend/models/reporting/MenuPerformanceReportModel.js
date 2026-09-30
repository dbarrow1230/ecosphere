//backend\models\reporting\MenuPerformanceReportModel.js
import mongoose from "mongoose";

const menuPerformanceItemSchema=new mongoose.Schema({
 section:{type:String,trim:true,default:""},
 itemName:{type:String,required:true,trim:true},
 price:{type:Number,default:0,min:0},
 estimatedFoodCost:{type:Number,default:0,min:0},
 estimatedFoodCostPercent:{type:Number,default:0,min:0},
 popularity:{type:String,enum:["unknown","low","medium","high"],default:"unknown"},
 margin:{type:String,enum:["unknown","low","medium","high"],default:"unknown"},
 performance:{type:String,enum:["star","plowhorse","puzzle","dog","unknown"],default:"unknown"},
 action:{type:String,enum:["keep","feature","reprice","rename","rework","remove","test"],default:"keep"},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const menuPerformanceReportSchema=new mongoose.Schema({
 report:{type:mongoose.Schema.Types.ObjectId,ref:"Report",default:null},
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},
 menuReview:{type:mongoose.Schema.Types.ObjectId,ref:"MenuReview",default:null},

 reportDate:{type:Date,default:Date.now},
 menuName:{type:String,trim:true,default:""},
 menuVersion:{type:String,trim:true,default:""},
 menuType:{type:String,trim:true,default:""},

 summary:{type:String,trim:true,default:""},
 strengths:[{type:String,trim:true}],
 weaknesses:[{type:String,trim:true}],
 recommendations:[{type:String,trim:true}],
 items:[menuPerformanceItemSchema],
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"menu_performance_reports"});

menuPerformanceReportSchema.index({report:1});
menuPerformanceReportSchema.index({clientBusiness:1});
menuPerformanceReportSchema.index({project:1});
menuPerformanceReportSchema.index({menuReview:1});
menuPerformanceReportSchema.index({reportDate:1});
menuPerformanceReportSchema.index({isActive:1});

export default mongoose.models.MenuPerformanceReport||mongoose.model("MenuPerformanceReport",menuPerformanceReportSchema);