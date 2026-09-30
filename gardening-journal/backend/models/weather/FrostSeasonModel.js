//backend/models/weather/FrostSeasonModel.js
import mongoose from 'mongoose';

const FrostSeasonSchema=new mongoose.Schema({
	key:{type:String}, // optional placeholder field
	zip:{type:String,required:true,index:true},
	year:{type:Number,required:true},
	lastFrost:String,
	firstFrost:String
},{timestamps:true,collection:'frost_season'}); // correct collection

FrostSeasonSchema.index({zip:1,year:1},{unique:true});

export default mongoose.model('FrostSeason',FrostSeasonSchema);