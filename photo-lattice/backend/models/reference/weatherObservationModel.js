import mongoose from 'mongoose';

const weatherObservationSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	temperature:{type:Number,default:null},
	humidity:{type:Number,default:null},
	rainfall:{type:Number,default:null},
	windSpeed:{type:Number,default:null},
	observationDate:{type:Date,default:Date.now},
	description:{type:String,trim:true,default:''},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"weather_observations"});

const WeatherObservation=mongoose.models.WeatherObservation||mongoose.model('WeatherObservation',weatherObservationSchema);

export default WeatherObservation;