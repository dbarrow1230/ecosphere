// backend/models/admin/auditLogModel.js
import mongoose from "mongoose";

const auditLogSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},

 action:{type:String,trim:true,default:""}, // create, update, delete

 entity:{type:String,trim:true,default:""}, // product, order, batch
 entityId:{type:mongoose.Schema.Types.ObjectId},

 before:{type:mongoose.Schema.Types.Mixed},
 after:{type:mongoose.Schema.Types.Mixed},

 ip:{type:String,trim:true,default:""}
},{timestamps:true,collection:"audit_logs"});

const AuditLog=mongoose.models.AuditLog||mongoose.model("AuditLog",auditLogSchema);

export default AuditLog;