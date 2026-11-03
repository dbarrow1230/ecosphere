// backend/models/pests/pestLogModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const noteSchema=new Schema({note:{type:String,trim:true,default:""},date:{type:Date,default:Date.now},createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}},{_id:false});

const severityHistorySchema=new Schema({
severity:{type:Schema.Types.ObjectId,ref:"SeverityScale",default:null},
date:{type:Date,default:Date.now},
note:{type:String,trim:true,default:""}
},{_id:false});

const treatmentAppliedSchema=new Schema({
treatment:{type:Schema.Types.ObjectId,ref:"PestRefTreatment",default:null},
date:{type:Date,default:Date.now},
note:{type:String,trim:true,default:""}
},{_id:false});

const pestLogSchema=new Schema({
planting:{type:Schema.Types.ObjectId,ref:"Planting",required:true},
pest:{type:Schema.Types.ObjectId,ref:"Pest",required:true},

status:{type:String,trim:true,default:"active"},

severityHistory:[severityHistorySchema],

dateObserved:{type:Date,default:Date.now},
dateResolved:{type:Date,default:null},

treatmentsApplied:[treatmentAppliedSchema],

notes:[noteSchema],
images:[String],

createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"pest_logs"});

const PestLog=mongoose.models.PestLog||mongoose.model("PestLog",pestLogSchema);

export default PestLog;