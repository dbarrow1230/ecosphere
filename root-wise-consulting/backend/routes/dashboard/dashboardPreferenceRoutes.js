//backend/routes/dashboard/dashboardPreferenceRoutes.js
import express from "express";
import {getDashboardPreference,upsertDashboardPreference} from "../../controllers/dashboard/dashboardPreferenceController.js";

const router=express.Router();

router.route("/")
 .get(getDashboardPreference)
 .post(upsertDashboardPreference);

export default router;