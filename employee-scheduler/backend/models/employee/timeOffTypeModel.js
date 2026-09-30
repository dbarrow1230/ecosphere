// backend/models/timeOffTypeModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const timeOffTypeSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},
 description:{type:String,trim:true,default:""},

 category:{type:String,enum:["vacation","sick","personal","holiday","bereavement","jury-duty","unpaid","other"],default:"other"},
 isPaid:{type:Boolean,default:false},
 requiresApproval:{type:Boolean,default:true},
 color:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"time_off_types"});

timeOffTypeSchema.index({business:1,name:1},{unique:true});
timeOffTypeSchema.index({business:1,code:1},{unique:true,sparse:true});
timeOffTypeSchema.index({business:1,isActive:1});

const TimeOffType=mongoose.models.TimeOffType||mongoose.model("TimeOffType",timeOffTypeSchema);

export default TimeOffType;