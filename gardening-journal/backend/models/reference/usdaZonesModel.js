// backend/models/reference/usdaZonesModel.js
import mongoose from 'mongoose';

const usdaZonesSchema=new mongoose.Schema({
	zone:{type:String,required:true,trim:true,unique:true,index:true},
	region:{type:String,required:true,trim:true},
	states:[{type:String,trim:true}],
	temperatureRange:{
		fahrenheit:{
			min:{type:Number,required:true},
			max:{type:Number,required:true}
		},
		celsius:{
			min:{type:Number,required:true},
			max:{type:Number,required:true}
		}
	},
	description:{type:String,trim:true,default:''},
	avgFrostDates:{
		lastSpringFrost:{type:String,trim:true,default:''},
		firstFallFrost:{type:String,trim:true,default:''}
	},
	plantingWindows:{
		indoorStart:{type:String,trim:true,default:''},
		transplantOutside:{type:String,trim:true,default:''},
		directSow:{type:String,trim:true,default:''},
		harvestWindow:{type:String,trim:true,default:''}
	}
},{timestamps:true,collection:"usda_zones"});

const USDAZones=mongoose.models.USDAZones||mongoose.model('USDAZones',usdaZonesSchema,'usda_zones');

export default USDAZones;