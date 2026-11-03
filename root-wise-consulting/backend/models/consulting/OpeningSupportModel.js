//backend/models/consulting/OpeningSupportModel.js
import mongoose from "mongoose";

const openingTaskSchema=new mongoose.Schema({
 category:{type:String,enum:["menu","recipe","costing","equipment","smallwares","staffing","training","vendor","prep","service","documentation","other"],default:"other"},
 task:{type:String,required:true,trim:true},
 owner:{type:String,trim:true,default:""},
 dueDate:{type:Date,default:null},
 status:{type:String,enum:["not-started","in-progress","blocked","done"],default:"not-started"},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const openingSupportSchema=new mongoose.Schema({
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
 title:{type:String,trim:true,default:""},
 openingDate:{type:Date,default:null},
 summary:{type:String,trim:true,default:""},
 tasks:[openingTaskSchema],
 risks:[{type:String,trim:true}],
 notes:{type:String,trim:true,default:""},
 status:{type:String,enum:["planning","in-progress","completed","paused"],default:"planning"},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"opening_support"});

openingSupportSchema.index({project:1});
openingSupportSchema.index({openingDate:1});
openingSupportSchema.index({status:1});
openingSupportSchema.index({isActive:1});

const OpeningSupport=mongoose.models.OpeningSupport||mongoose.model("OpeningSupport",openingSupportSchema);

export default OpeningSupport;