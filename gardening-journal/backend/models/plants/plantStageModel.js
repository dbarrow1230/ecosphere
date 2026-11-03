import mongoose from "mongoose";
const {Schema,model}=mongoose;

const plantStageSchema=new Schema({
name:{type:String,trim:true,default:""},
description:{type:String,trim:true,default:""},
order:{type:Number,default:0},
isActive:{type:Boolean,default:true},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"plant_stages"});

const PlantStage=mongoose.models.PlantStage||mongoose.model("PlantStage",plantStageSchema);

export default PlantStage;