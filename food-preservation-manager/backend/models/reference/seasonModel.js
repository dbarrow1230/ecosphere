// backend/models/reference/seasonModel.js
import mongoose from 'mongoose';

const seasonSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	description:{type:String,trim:true,default:''},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"seasons"});

const Season=mongoose.models.Season||mongoose.model('Season',seasonSchema,'seasons');

export default Season;