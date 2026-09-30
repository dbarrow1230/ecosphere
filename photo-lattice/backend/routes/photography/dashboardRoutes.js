import express from "express";
import {protect} from "../../middleware/authMiddleware.js";
import {getPhotographyDashboard,exportPhotography} from "../../controllers/photography/dashboardController.js";
const router=express.Router();
router.use(protect);
router.get("/dashboard",getPhotographyDashboard);
router.get("/export",exportPhotography);
export default router;
