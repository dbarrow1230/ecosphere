import mongoose from 'mongoose';

const plantTypeSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	description:{type:String,trim:true,default:''},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"plant_types"});

const PlantType=mongoose.models.PlantType||mongoose.model('PlantType',plantTypeSchema);

export default PlantType;