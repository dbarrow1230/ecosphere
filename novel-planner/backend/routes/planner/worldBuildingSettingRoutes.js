// backend/routes/planner/worldBuildingSettingRoutes.js
import express from "express";
import {
 getWorldBuildingSetting,
 getWorldBuildingSettingById,
 saveWorldBuildingSetting,
 updateWorldBuildingSetting,
 archiveWorldBuildingSetting
} from "../../controllers/planner/worldBuildingSettingController.js";

const router=express.Router();

router.get("/",getWorldBuildingSetting);
router.get("/:id",getWorldBuildingSettingById);
router.post("/",saveWorldBuildingSetting);
router.put("/:id",updateWorldBuildingSetting);
router.patch("/:id/archive",archiveWorldBuildingSetting);

export default router;