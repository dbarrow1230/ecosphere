//backend/models/foundation/AuditLogModel.js
import mongoose from "mongoose";

const auditChangeSchema=new mongoose.Schema({
 field:{type:String,trim:true,default:""},
 oldValue:{type:mongoose.Schema.Types.Mixed,default:null},
 newValue:{type:mongoose.Schema.Types.Mixed,default:null}
},{_id:false});

const auditLogSchema=new mongoose.Schema({
 modelType:{type:String,required:true,trim:true},
 recordId:{type:mongoose.Schema.Types.ObjectId,required:true},

 action:{type:String,enum:["create","update","delete","restore","status-change","login","logout","other"],required:true},
 message:{type:String,trim:true,default:""},

 changes:[auditChangeSchema],

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 ipAddress:{type:String,trim:true,default:""},
 userAgent:{type:String,trim:true,default:""},

 metadata:{type:mongoose.Schema.Types.Mixed,default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"audit_logs"});

auditLogSchema.index({modelType:1,recordId:1});
auditLogSchema.index({action:1});
auditLogSchema.index({user:1});
auditLogSchema.index({createdAt:1});
auditLogSchema.index({isActive:1});

const AuditLog=mongoose.models.AuditLog||mongoose.model("AuditLog",auditLogSchema);

export default AuditLog;