// backend/models/reference/fertilizerModel.js
import mongoose from 'mongoose';

const fertilizerSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	type:{type:mongoose.Schema.Types.ObjectId,ref:'FertilizerType',default:null},
	description:{type:String,trim:true,default:''},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"fertilizers"});
const Fertilizer=mongoose.models.Fertilizer||mongoose.model('Fertilizer',fertilizerSchema,'fertilizers');
export default Fertilizer;