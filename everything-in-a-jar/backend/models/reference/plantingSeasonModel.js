//backend/models/reference/plantingSeasonModel.js
import mongoose from 'mongoose';
import './seasonModel.js';

const plantingSeasonSchema=new mongoose.Schema({
	name:{type:String,required:true,trim:true,unique:true},
	season:{type:mongoose.Schema.Types.ObjectId,ref:'Season'},
	startMonth:{type:Number,min:1,max:12},
	endMonth:{type:Number,min:1,max:12},
	indoorStartWeeksBeforeLastFrost:{type:Number},
	transplantWeeksAfterLastFrost:{type:Number},
	directSowWeeksBeforeLastFrost:{type:Number},
	directSowWeeksAfterLastFrost:{type:Number},
	fallPlantingWeeksBeforeFirstFrost:{type:Number},
	notes:{type:String,trim:true},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:'planting_seasons'});

const PlantingSeason=mongoose.models.PlantingSeason||mongoose.model('PlantingSeason',plantingSeasonSchema,'planting_seasons');

export default PlantingSeason;