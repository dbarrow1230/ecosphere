// backend/models/fertilizers/fertilizerApplicationModel.js
import mongoose from 'mongoose';

const fertilizerApplicationSchema=new mongoose.Schema({
	fertilizer:{type:mongoose.Schema.Types.ObjectId,ref:'Fertilizer',default:null},
	plantName:{type:String,trim:true,default:""},
	location:{type:String,trim:true,default:""},
	problem:{type:String,trim:true,default:""},
	applicationDate:{type:Date,default:null},
	treatment:{type:String,trim:true,default:""},
	results:{type:String,trim:true,default:""},
	name:{type:String,trim:true,default:''},
	method:{type:String,trim:true,default:''},
	timing:{type:String,trim:true,default:''},
	description:{type:String,trim:true,default:''},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"fertilizer_applications"});

const FertilizerApplication=mongoose.models.FertilizerApplication||mongoose.model('FertilizerApplication',fertilizerApplicationSchema);

export default FertilizerApplication;