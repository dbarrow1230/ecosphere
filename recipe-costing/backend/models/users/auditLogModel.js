// backend/models/users/auditLogModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const auditLogSchema=new mongoose.Schema(
{
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 module:{type:String,trim:true,lowercase:true,default:""},
 action:{type:String,required:true,trim:true,lowercase:true},
 entityType:{type:String,trim:true,default:""},
 entityId:{type:mongoose.Schema.Types.ObjectId,default:null},
 before:{type:mongoose.Schema.Types.Mixed,default:null},
 after:{type:mongoose.Schema.Types.Mixed,default:null},
 meta:{type:mongoose.Schema.Types.Mixed,default:null},
 ip:{type:String,trim:true,default:""},
 userAgent:{type:String,trim:true,default:""},
 status:{type:String,enum:["success","failed"],default:"success"}
},
{timestamps:true,collection:"audit_logs"}
);

auditLogSchema.index({business:1,module:1,createdAt:-1});
auditLogSchema.index({user:1,createdAt:-1});
auditLogSchema.index({entityType:1,entityId:1});
auditLogSchema.index({action:1,createdAt:-1});

const AuditLog=businessInfoConnection.models.AuditLog||businessInfoConnection.model("AuditLog",auditLogSchema);

export default AuditLog;