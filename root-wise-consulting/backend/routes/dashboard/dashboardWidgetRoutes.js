//backend/routes/dashboard/dashboardWidgetRoutes.js
import express from "express";
import {createDashboardWidget,getDashboardWidgets,updateDashboardWidget,deleteDashboardWidget} from "../../controllers/dashboard/dashboardWidgetController.js";

const router=express.Router();

router.route("/")
 .post(createDashboardWidget)
 .get(getDashboardWidgets);

router.route("/:id")
 .put(updateDashboardWidget)
 .delete(deleteDashboardWidget);

export default router;