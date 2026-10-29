// backend/routes/reference/usdaZonesRoutes.js
import express from "express";
import {
	getUSDAZoneByZone,
	getUSDAZonesByRange,
	createUSDAZone,
	getAllUSDAZones,
	updateUSDAZoneByZone,
	deleteUSDAZoneByZone
} from "../../controllers/reference/usdaZonesController.js";

const router=express.Router();

router.get("/",getAllUSDAZones);
router.get("/range/:range",getUSDAZonesByRange);
router.get("/:zone",getUSDAZoneByZone);
router.post("/",createUSDAZone);
router.put("/:zone",updateUSDAZoneByZone);
router.delete("/:zone",deleteUSDAZoneByZone);

export default router;
