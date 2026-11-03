import mongoose from "mongoose";
const {Schema,model}=mongoose;

const noteSchema=new Schema({
note:{type:String,trim:true,default:""},
date:{type:Date,default:Date.now},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{_id:false});

const activitySchema=new Schema({
title:{type:String,trim:true,default:""},
description:{type:String,trim:true,default:""},

activityType:{type:Schema.Types.ObjectId,ref:"ActivityType",default:null},

garden:{type:Schema.Types.ObjectId,ref:"Garden",default:null},
section:{type:Schema.Types.ObjectId,ref:"GardenSection",default:null},
planting:{type:Schema.Types.ObjectId,ref:"Planting",default:null},
seed:{type:Schema.Types.ObjectId,ref:"Seed",default:null},
plant:{type:Schema.Types.ObjectId,ref:"Plant",default:null},
hydroSystem:{type:Schema.Types.ObjectId,ref:"HydroSystem",default:null},
hydroDevice:{type:Schema.Types.ObjectId,default:null},
hydroPodPosition:{type:Number,default:null},
equipment:{type:Schema.Types.ObjectId,ref:"Equipment",default:null},
outcome:{type:String,trim:true,enum:["","planned","completed","partial","needs-follow-up","failed","resolved"],default:""},
followUpDate:{type:Date,default:null},

activityDate:{type:Date,default:Date.now},
durationMinutes:{type:Number,default:0},

status:{type:String,enum:["planned","in_progress","completed","cancelled"],default:"completed"},
priority:{type:String,enum:["low","medium","high"],default:"medium"},

tags:[String],
images:[String],
notes:[noteSchema],

createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"activities"});

const Activity=mongoose.models.Activity||mongoose.model("Activity",activitySchema);

export default Activity;
