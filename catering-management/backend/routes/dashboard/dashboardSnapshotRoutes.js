// backend/routes/dashboard/dashboardSnapshotRoutes.js
import express from "express";
import {
createDashboardSnapshot,
getDashboardSnapshots,
getDashboardSnapshotById,
deleteDashboardSnapshot
} from "../../controllers/dashboard/dashboardSnapshotController.js";

const router=express.Router();

router.get("/",getDashboardSnapshots);
router.post("/",createDashboardSnapshot);
router.get("/:id",getDashboardSnapshotById);
router.delete("/:id",deleteDashboardSnapshot);

export default router;
