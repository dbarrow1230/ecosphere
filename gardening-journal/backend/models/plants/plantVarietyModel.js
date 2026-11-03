import mongoose from "mongoose";
const {Schema,model}=mongoose;

const plantVarietySchema=new Schema({
name:{type:String,trim:true,default:""},
plant:{type:Schema.Types.ObjectId,ref:"Plant",required:true},
description:{type:String,trim:true,default:""},
isActive:{type:Boolean,default:true},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"plant_varieties"});

const PlantVariety=mongoose.models.PlantVariety||mongoose.model("PlantVariety",plantVarietySchema);

export default PlantVariety;