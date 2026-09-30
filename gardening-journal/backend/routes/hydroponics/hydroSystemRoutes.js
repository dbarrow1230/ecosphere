import express from "express";
import {
 createHydroSystem,
 getHydroSystems,
 getHydroSystemById,
 updateHydroSystem,
 updateHydroSystemPods,
 deleteHydroSystem
} from "../../controllers/hydroponics/hydroSystemController.js";

const router=express.Router();

router.post("/",createHydroSystem);
router.get("/",getHydroSystems);
router.get("/:id",getHydroSystemById);
router.put("/:id",updateHydroSystem);
router.patch("/:id/pods",updateHydroSystemPods);
router.delete("/:id",deleteHydroSystem);

export default router;
