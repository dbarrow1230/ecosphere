// backend/models/gardens/gardenSectionModel.js
import mongoose from "mongoose";
const {Schema}=mongoose;

const metricDimensionSchema=new Schema({
label:{type:String,trim:true,default:""},
value:{type:Number,default:0},
unit:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null}
},{_id:false});

const imperialDimensionSchema=new Schema({
label:{type:String,trim:true,default:""},
value:{type:Number,default:0},
unit:{type:Schema.Types.ObjectId,ref:"ImperialUnit",default:null}
},{_id:false});

const gardenSectionSchema=new Schema({
garden:{type:Schema.Types.ObjectId,ref:"Garden",required:true},

name:{type:String,trim:true,default:""},
type:{type:Schema.Types.ObjectId,ref:"GardenLocationType",required:true},
size:{
metric:[metricDimensionSchema],
imperial:[imperialDimensionSchema]
},

notes:[{
note:{type:String,trim:true,default:""},
date:{type:Date,default:Date.now},
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
}],

createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}

},{timestamps:true,collection:"garden_sections"});
const GardenSection=mongoose.models.GardenSection||mongoose.model("GardenSection",gardenSectionSchema);
export default GardenSection;
