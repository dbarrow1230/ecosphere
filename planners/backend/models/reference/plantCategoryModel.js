import mongoose from 'mongoose';

const plantCategorySchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	description:{type:String,trim:true,default:''},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"plant_categories"});

const PlantCategory=mongoose.models.PlantCategory||mongoose.model('PlantCategory',plantCategorySchema);

export default PlantCategory;