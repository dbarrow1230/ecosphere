// backend/routes/scheduling/shiftRoutes.js
import express from "express";
import {
 createShift,
 getShifts,
 getShiftById,
 updateShift,
 deleteShift
} from "../../controllers/scheduling/shiftController.js";

const router=express.Router();

router.post("/",createShift);
router.get("/",getShifts);
router.get("/:id",getShiftById);
router.put("/:id",updateShift);
router.delete("/:id",deleteShift);

export default router;