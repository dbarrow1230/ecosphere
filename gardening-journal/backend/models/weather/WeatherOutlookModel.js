import mongoose from 'mongoose';

const WeatherOutlookSchema=new mongoose.Schema({
	type:{type:String,required:true,index:true}, 
	// 'drought' | 'enso' | 'hazards' | 'seasonal' | 'severe' | 'river'

	source:{type:String,required:true}, 
	// 'CPC' | 'SPC' | 'NWS'

	issuedAt:{type:Date,required:true,index:true},

	title:String,
	link:String,

	// DO NOT ASSUME STRUCTURE
	rawText:String,
	rawData:Object

},{timestamps:true,collection:'weatherOutlook'});

export default mongoose.model('WeatherOutlook',WeatherOutlookSchema);