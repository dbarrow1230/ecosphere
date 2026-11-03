import express from "express";
import {createShift,deleteShift,getShifts,publishShifts,updateShift} from "../../controllers/operations/shiftController.js";
const router=express.Router();
router.get("/",getShifts);
router.post("/",createShift);
router.post("/publish",publishShifts);
router.put("/:id",updateShift);
router.delete("/:id",deleteShift);
export default router;
