// backend/routes/dashboard/dashboardSnapshotRoutes.js
import express from "express";
import {
getDashboardSnapshot,
createOrUpdateDashboardSnapshot,
deleteDashboardSnapshot
} from "../../controllers/dashboard/dashboardSnapshotController.js";

const router=express.Router();

router.get("/",getDashboardSnapshot);
router.post("/",createOrUpdateDashboardSnapshot);
router.delete("/:year",deleteDashboardSnapshot);

export default router;