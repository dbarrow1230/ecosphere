// backend/routes/employees/leaveRoutes.js
import express from "express";
import {createLeave,getLeaves,updateLeave} from "../../controllers/employees/leaveController.js";

const router=express.Router();

router.post("/",createLeave);
router.get("/",getLeaves);
router.put("/:id",updateLeave);

export default router;
