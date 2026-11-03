// backend/routes/employee/timeOffRequestRoutes.js
import express from "express";
import {
 createTimeOffRequest,
 getTimeOffRequests,
 getTimeOffRequestById,
 updateTimeOffRequest,
 deleteTimeOffRequest
} from "../../controllers/employee/timeOffRequestController.js";

const router=express.Router();

router.post("/",createTimeOffRequest);
router.get("/",getTimeOffRequests);
router.get("/:id",getTimeOffRequestById);
router.put("/:id",updateTimeOffRequest);
router.delete("/:id",deleteTimeOffRequest);

export default router;