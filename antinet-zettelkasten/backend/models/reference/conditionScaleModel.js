import mongoose from 'mongoose';

const conditionScaleSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	description:{type:String,trim:true,default:''},
	level:{type:Number,default:0},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"condition_scales"});

const ConditionScale=mongoose.models.ConditionScale||mongoose.model('ConditionScale',conditionScaleSchema);

export default ConditionScale;