import express from "express";
import {createStaff,deleteStaff,getStaff,updateStaff} from "../../controllers/operations/staffController.js";
const router=express.Router();
router.get("/",getStaff);
router.post("/",createStaff);
router.put("/:id",updateStaff);
router.delete("/:id",deleteStaff);
export default router;
