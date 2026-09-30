// backend/models/gardens/gardenModel.js
import mongoose from "mongoose";
const {Schema}=mongoose;

const noteSchema=new Schema({
note:{type:String,trim:true,default:""},
date:{type:Date,default:Date.now},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{_id:false});

const gardenSchema=new Schema({
name:{type:String,trim:true,default:""},
gardenType:{type:Schema.Types.ObjectId,ref:"GardenType",default:null},
gardenPurpose:[{type:Schema.Types.ObjectId,ref:"GardenPurpose"}],
userReason:[{type:Schema.Types.ObjectId,ref:"GardenReason"}],

overallSize:{
metric:[{
label:{type:String,trim:true,default:""},
value:{type:Number,default:0},
unit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null}
}],
imperial:[{
label:{type:String,trim:true,default:""},
value:{type:Number,default:0},
unit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:null}
}]
},

notes:[noteSchema],

sections:[{type:Schema.Types.ObjectId,ref:"GardenSection"}],

createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"gardens"});

const Garden=mongoose.models.Garden||mongoose.model("Garden",gardenSchema);

export default Garden;
