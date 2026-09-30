import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;
const HaccpLogSchema=new Schema({
 business:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 recipe:{type:Schema.Types.ObjectId,ref:"Recipe",required:true,index:true},
 productionDate:{type:Date,required:true,index:true},
 batchCode:{type:String,required:true,trim:true,index:true},
 shift:{type:String,trim:true,default:""},
 location:{type:String,trim:true,default:""},
 completedBy:{type:String,required:true,trim:true},
 supervisor:{type:String,trim:true,default:""},
 status:{type:String,enum:["draft","completed","verified"],default:"draft",index:true},
 haccpChecks:[{
  code:{type:String,trim:true,required:true},description:{type:String,trim:true,default:""},
  result:{type:String,enum:["","pass","fail","not-applicable"],default:""},
  observation:{type:String,trim:true,default:""},initials:{type:String,trim:true,default:""}
 }],
 ccpChecks:[{
  code:{type:String,trim:true,required:true},criticalControlPoint:{type:String,trim:true,default:""},hazard:{type:String,trim:true,default:""},criticalLimit:{type:String,trim:true,default:""},
  observedValue:{type:String,trim:true,default:""},observedAt:{type:Date,default:null},monitoringResult:{type:String,enum:["","pass","fail","not-applicable"],default:""},
  correctiveActionTaken:{type:String,trim:true,default:""},verifiedBy:{type:String,trim:true,default:""},verificationDate:{type:Date,default:null}
 }],
 notes:{type:String,trim:true,default:""},
 employeeSignature:{type:String,trim:true,default:""},
 supervisorSignature:{type:String,trim:true,default:""}
},{timestamps:true,collection:"haccp_logs"});

HaccpLogSchema.index({business:1,recipe:1,productionDate:-1});
HaccpLogSchema.index({business:1,batchCode:1},{unique:true});
export default businessInfoConnection.models.HaccpLog||businessInfoConnection.model("HaccpLog",HaccpLogSchema);
