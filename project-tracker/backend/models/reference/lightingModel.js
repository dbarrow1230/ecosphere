// backend/models/reference/lightingModel.js
import mongoose from 'mongoose';

const lightingSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	description:{type:String,trim:true,default:''},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"lighting"});

const Lighting=mongoose.models.Lighting||mongoose.model('Lighting',lightingSchema,'lighting');

export default Lighting;