import mongoose from 'mongoose';

const soilTypeSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	description:{type:String,trim:true,default:''},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"soil_types"});

const SoilType=mongoose.models.SoilType||mongoose.model('SoilType',soilTypeSchema);

export default SoilType;