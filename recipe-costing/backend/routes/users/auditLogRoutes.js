// backend/routes/users/auditLogRoutes.js
import express from "express";
import {
 createAuditLog,
 getAuditLogs,
 getAuditLogById,
 deleteAuditLog
} from "../../controllers/users/auditLogController.js";

const router=express.Router();

router.route("/")
 .get(getAuditLogs)
 .post(createAuditLog);

router.route("/:id")
 .get(getAuditLogById)
 .delete(deleteAuditLog);

export default router;