// backend/routes/poetryMeterRoutes.js
import express from "express";
import {
 getPoetryMeters,
 getPoetryMeter,
 createPoetryMeter,
 updatePoetryMeter,
 deletePoetryMeter
} from "../controllers/poetryMeterController.js";

const router=express.Router();

router.get("/",getPoetryMeters);
router.get("/:id",getPoetryMeter);
router.post("/",createPoetryMeter);
router.put("/:id",updatePoetryMeter);
router.delete("/:id",deletePoetryMeter);

export default router;