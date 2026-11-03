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

const bedCellSchema=new Schema({
 row:{type:Number,min:0,required:true,validate:Number.isInteger},
 column:{type:Number,min:0,required:true,validate:Number.isInteger},
 label:{type:String,trim:true,required:true,maxLength:200},
 sourceType:{type:String,enum:["seed","plant","custom"],default:"custom"},
 sourceId:{type:String,default:""}
},{_id:false});

const bedLayoutSchema=new Schema({
 rows:{type:Number,min:1,max:20,default:4,validate:Number.isInteger},
 columns:{type:Number,min:1,max:20,default:8,validate:Number.isInteger},
 cellSize:{type:Number,min:.01,max:1000,default:1},
 unit:{type:String,enum:["ft","in","m","cm"],default:"ft"},
 cells:{type:[bedCellSchema],default:[]}
},{_id:false});
bedLayoutSchema.pre("validate",function(){
 const occupied=new Set();
 for(const cell of this.cells){
  if(cell.row>=this.rows||cell.column>=this.columns)this.invalidate("cells","Plant placement is outside the bed");
  const key=`${cell.row}:${cell.column}`;
  if(occupied.has(key))this.invalidate("cells","Only one placement is allowed in each cell");
  occupied.add(key);
 }
});

const gardenSectionSchema=new Schema({
bedLayout:{type:bedLayoutSchema,default:()=>({})},
garden:{type:Schema.Types.ObjectId,ref:"Garden",required:true},

soilType:{type:String,trim:true,default:""},
drainage:{type:String,trim:true,default:""},
locationDescription:{type:String,trim:true,default:""},
sunExposure:{type:String,trim:true,default:""},
layoutPlan:{type:String,trim:true,default:""},
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
