// backend/services/auditLogService.js
import AuditLog from "../models/auditLogModel.js";

export const logAction=async(payload)=>{
 return AuditLog.create(payload);
};

export default {
 logAction
};