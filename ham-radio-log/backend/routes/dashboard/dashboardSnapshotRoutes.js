//backend/routes/dashboard/dashboardSnapshotRoutes.js
import express from "express";
import {createDashboardSnapshot,getDashboardSnapshots,getDashboardSnapshotById,deleteDashboardSnapshot} from "../../controllers/dashboard/dashboardSnapshotController.js";

const router=express.Router();

router.post("/",createDashboardSnapshot);
router.get("/",getDashboardSnapshots);
router.get("/:id",getDashboardSnapshotById);
router.delete("/:id",deleteDashboardSnapshot);

export default router;