// backend/routes/employee/timeOffTypeRoutes.js
import express from "express";
import {
 createTimeOffType,
 getTimeOffTypes,
 getTimeOffTypeById,
 updateTimeOffType,
 deleteTimeOffType
} from "../../controllers/employee/timeOffTypeController.js";

const router=express.Router();

router.post("/",createTimeOffType);
router.get("/",getTimeOffTypes);
router.get("/:id",getTimeOffTypeById);
router.put("/:id",updateTimeOffType);
router.delete("/:id",deleteTimeOffType);

export default router;