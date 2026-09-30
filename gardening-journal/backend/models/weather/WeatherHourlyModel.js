// backend/models/weather/WeatherHourlyModel.js
import mongoose from 'mongoose';

const WeatherHourlySchema=new mongoose.Schema({
	zip:{type:String,required:true,index:true},
	date:{type:String,required:true}, // YYYY-MM-DD
	hour:{type:Number,required:true}, // 0–23

	temp:Number,
	feelsLike:Number,
	humidity:Number,
	windSpeed:Number,
	windDirection:String,
	precipProbability:Number,
	conditions:String,

	source:{type:String,default:'NWS'}
},{timestamps:true,collection:'weather_hourly'});

WeatherHourlySchema.index({zip:1,date:1,hour:1},{unique:true});

export default mongoose.model('WeatherHourly',WeatherHourlySchema);