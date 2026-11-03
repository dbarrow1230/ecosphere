//backend/models/dashboard/DashboardWidgetModel.js
import mongoose from "mongoose";

const dashboardWidgetSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 widgetKey:{type:String,required:true,trim:true},
 title:{type:String,trim:true,default:""},

 type:{type:String,enum:["stat","list","chart","table","custom"],default:"stat"},

 config:{
  type:Object,
  default:{}
 },

 position:{
  x:{type:Number,default:0},
  y:{type:Number,default:0},
  w:{type:Number,default:2},
  h:{type:Number,default:2}
 },

 isVisible:{type:Boolean,default:true},
 isActive:{type:Boolean,default:true},

 notes:{type:String,trim:true,default:""}

},{timestamps:true,collection:"dashboard_widgets"});

dashboardWidgetSchema.index({user:1});
dashboardWidgetSchema.index({widgetKey:1});
dashboardWidgetSchema.index({isActive:1});

const DashboardWidget=mongoose.models.DashboardWidget||mongoose.model("DashboardWidget",dashboardWidgetSchema);

export default DashboardWidget;