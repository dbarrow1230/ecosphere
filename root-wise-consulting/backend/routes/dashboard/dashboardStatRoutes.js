//backend/routes/dashboard/dashboardStatRoutes.js
import express from "express";
import {createDashboardStat,getDashboardStats} from "../../controllers/dashboard/dashboardStatController.js";

const router=express.Router();

router.route("/")
 .post(createDashboardStat)
 .get(getDashboardStats);

export default router;