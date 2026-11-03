// backend/routes/staffAssignmentRoutes.js
import express from "express";
import {createStaffAssignment,getStaffAssignments,getSingleStaffAssignment,updateStaffAssignment,deleteStaffAssignment} from "../controllers/staffAssignmentController.js";

const router=express.Router();

router.post("/",createStaffAssignment);
router.get("/",getStaffAssignments);
router.get("/:id",getSingleStaffAssignment);
router.put("/:id",updateStaffAssignment);
router.delete("/:id",deleteStaffAssignment);

export default router;