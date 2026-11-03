//backend/models/weather/WeatherDailyModel.js
import mongoose from 'mongoose';

const WeatherDailySchema=new mongoose.Schema({
	key:{type:String}, // optional placeholder field (not required)
	zip:{type:String,required:true,index:true},
	date:{type:String,required:true},
	tempMin:Number,
	tempMax:Number,
	precip:Number,
	conditions:String,
	isFrost:Boolean
},{timestamps:true,collection:'weather_daily'}); 

WeatherDailySchema.index({zip:1,date:1},{unique:true});

export default mongoose.model('WeatherDaily',WeatherDailySchema);