// backend/routes/auditLogRoutes.js
import express from "express";
import {
 createAuditLog,
 getAuditLogs,
 getAuditLogById,
 updateAuditLog,
 deleteAuditLog
} from "../controllers/auditLogController.js";

const router=express.Router();

router.post("/",createAuditLog);
router.get("/",getAuditLogs);
router.get("/:id",getAuditLogById);
router.put("/:id",updateAuditLog);
router.delete("/:id",deleteAuditLog);

export default router;