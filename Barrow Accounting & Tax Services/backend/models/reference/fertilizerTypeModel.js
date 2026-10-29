import mongoose from 'mongoose';

const fertilizerTypeSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	description:{type:String,trim:true,default:''},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"fertilizer_types"});

const FertilizerType=mongoose.models.FertilizerType||mongoose.model('FertilizerType',fertilizerTypeSchema);

export default FertilizerType;