import express from "express";
import {getLibraryDashboardSummary} from "../../controllers/dashboard/libraryDashboardController.js";

const router=express.Router();

router.get("/",getLibraryDashboardSummary);
router.get("/library-summary",getLibraryDashboardSummary);

export default router;
