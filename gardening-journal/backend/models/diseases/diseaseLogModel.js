// backend/models/diseases/diseaseLogModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const severityHistorySchema=new Schema({
severity:{type:String,enum:["low","mild","moderate","high","severe"],required:true},
date:{type:Date,default:Date.now},
note:String
},{_id:false});

const diseaseLogSchema=new Schema({
user:{type:Schema.Types.ObjectId,ref:"User",required:true},
planting:{type:Schema.Types.ObjectId,ref:"Planting",required:true},
disease:{type:Schema.Types.ObjectId,ref:"Disease",required:true},

status:{type:String,enum:["suspected","confirmed","monitoring","treated","resolved","lost"],default:"suspected"},

// history instead of overwriting
severityHistory:[severityHistorySchema],

affectedAreas:[String],
symptomsObserved:[String],

dateObserved:{type:Date,default:Date.now},
dateResolved:Date,

treatmentsApplied:[{
treatment:{type:Schema.Types.ObjectId,ref:"DiseaseRefTreatment"},
date:{type:Date,default:Date.now},
note:String
}],

notes:String,
images:[String]

},{timestamps:true,collection:"disease_logs"});

export default model("DiseaseLog",diseaseLogSchema);