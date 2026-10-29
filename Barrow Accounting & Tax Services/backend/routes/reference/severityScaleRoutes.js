// backend/routes/reference/severityScaleRoutes.js
import express from "express";
import {
createSeverityScale,
getSeverityScales,
getSeverityScaleById,
updateSeverityScale,
deleteSeverityScale
} from "../../controllers/reference/severityScaleController.js";

const router=express.Router();

router.post("/",createSeverityScale);
router.get("/",getSeverityScales);
router.get("/:id",getSeverityScaleById);
router.put("/:id",updateSeverityScale);
router.delete("/:id",deleteSeverityScale);

export default router;