//backend/models/dashboard/DashboardPreferenceModel.js
import mongoose from "mongoose";

const dashboardPreferenceSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},

 layout:{type:String,enum:["grid","list"],default:"grid"},
 theme:{type:String,enum:["light","dark"],default:"light"},

 widgetsOrder:[{type:String,trim:true}],
 hiddenWidgets:[{type:String,trim:true}],

 defaultDateRange:{type:String,enum:["7d","30d","90d","1y","all"],default:"30d"},

 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true}

},{timestamps:true,collection:"dashboard_preferences"});

dashboardPreferenceSchema.index({user:1},{unique:true});
dashboardPreferenceSchema.index({isActive:1});

const DashboardPreference=mongoose.models.DashboardPreference||mongoose.model("DashboardPreference",dashboardPreferenceSchema);

export default DashboardPreference;