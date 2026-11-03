// backend/models/SeriesModel.js
import mongoose from "mongoose";

const SeriesModelSchema=new mongoose.Schema({
 name:{type:String,trim:true,required:true,index:true},
 numberOfBooks:{type:Number,required:true,min:1}
},{timestamps:true, collection:"series"});

const SeriesModel=mongoose.models.Series||mongoose.model("Series",SeriesModelSchema);

export default SeriesModel;