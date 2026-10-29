import mongoose from 'mongoose';

const harvestQualityScaleSchema=new mongoose.Schema({
name:{type:String,trim:true,default:''},
description:{type:String,trim:true,default:''},
level:{type:Number,required:true,default:0},
isActive:{type:Boolean,default:true},
createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null}
},{timestamps:true,collection:"harvest_quality_scales"});

const HarvestQualityScale=mongoose.models.HarvestQualityScale||mongoose.model('HarvestQualityScale',harvestQualityScaleSchema);

export default HarvestQualityScale;