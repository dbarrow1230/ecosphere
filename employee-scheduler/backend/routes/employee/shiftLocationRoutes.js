// backend/routes/employee/shiftLocationRoutes.js
import express from "express";
import {
 createShiftLocation,
 getShiftLocations,
 getShiftLocationById,
 updateShiftLocation,
 deleteShiftLocation
} from "../../controllers/employee/shiftLocationController.js";

const router=express.Router();

router.post("/",createShiftLocation);
router.get("/",getShiftLocations);
router.get("/:id",getShiftLocationById);
router.put("/:id",updateShiftLocation);
router.delete("/:id",deleteShiftLocation);

export default router;