// backend/models/auditLogModel.js
import mongoose from "mongoose";

const changeSchema=new mongoose.Schema({
 field:{type:String,trim:true,default:""},
 oldValue:{type:mongoose.Schema.Types.Mixed,default:null},
 newValue:{type:mongoose.Schema.Types.Mixed,default:null}
},{_id:false});

const auditLogSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 entityType:{type:String,required:true,trim:true,index:true},
 entityId:{type:mongoose.Schema.Types.ObjectId,required:true,index:true},

 action:{type:String,required:true,trim:true,index:true},
 description:{type:String,trim:true,default:""},

 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null,index:true},
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},

 changes:{type:[changeSchema],default:[]},

 ipAddress:{type:String,trim:true,default:""},
 userAgent:{type:String,trim:true,default:""},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"auditLogs"});

auditLogSchema.index({business:1,entityType:1,entityId:1,createdAt:-1});
auditLogSchema.index({business:1,action:1,createdAt:-1});
auditLogSchema.index({business:1,user:1,createdAt:-1});
auditLogSchema.index({business:1,employee:1,createdAt:-1});

const AuditLog=mongoose.models.AuditLog||mongoose.model("AuditLog",auditLogSchema);

export default AuditLog;