import mongoose from 'mongoose';

const severityScaleSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	description:{type:String,trim:true,default:''},
	level:{type:Number,default:0},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"severity_scales"});

const SeverityScale=mongoose.models.SeverityScale||mongoose.model('SeverityScale',severityScaleSchema);

export default SeverityScale;