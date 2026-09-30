import Business from "../reference/businessModel.js";
import Location from "../reference/LocationModel.js";
// src/backend/models/dashboard/dashboardSnapshot.js
import mongoose from "mongoose";

const dashboardSnapshotSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 roleScope:{type:String,required:true,enum:["owner","manager"],index:true},
 locationRefs:[{type:mongoose.Schema.Types.ObjectId,ref:Location}],
 selectedPeriod:{type:String,required:true,enum:["day","week","month","year"],index:true},
 currentLabel:{type:String,trim:true,default:""},
 compareLabel:{type:String,trim:true,default:""},
 filters:{type:Object,default:{}},
 generatedAt:{type:Date,required:true,index:true}
},{ timestamps:true, collection:"dashboard_snapshots"});

dashboardSnapshotSchema.index({business_id:1,roleScope:1});
dashboardSnapshotSchema.index({business_id:1,generatedAt:-1});
dashboardSnapshotSchema.index({business_id:1,selectedPeriod:1});

const DashboardSnapshot=mongoose.models.DashboardSnapshot||mongoose.model("DashboardSnapshot",dashboardSnapshotSchema);

export default DashboardSnapshot;