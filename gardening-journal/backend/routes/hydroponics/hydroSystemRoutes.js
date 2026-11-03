import express from "express";
import {
 createHydroSystem,
 getHydroSystems,
 getHydroSystemById,
 updateHydroSystem,
 updateHydroSystemPods,
 deleteHydroSystem,
 createHydroPod,changeHydroPodRecord,retryHydroPod,getHydroReports
} from "../../controllers/hydroponics/hydroSystemController.js";

const router=express.Router();

router.post("/",createHydroSystem);
router.get("/",getHydroSystems);
router.get("/reports",getHydroReports);
router.post("/:id/pods",createHydroPod);
router.post("/:id/retries",retryHydroPod);
router.patch("/:id/pods/:podId/:action",changeHydroPodRecord);
router.get("/:id",getHydroSystemById);
router.put("/:id",updateHydroSystem);
router.patch("/:id/pods",updateHydroSystemPods);
router.delete("/:id",deleteHydroSystem);

export default router;
