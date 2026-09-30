import express from "express";
import getDashboardDataController from "../../controllers/dashboard/getDashboardDataController.js";

const router=express.Router();

router.get("/",getDashboardDataController);

export default router;