// backend/routes/counterRoutes.js
import express from "express";
import {
 createCounter,
 getCounters,
 getCounterById,
 updateCounter,
 deleteCounter,
 getNextCounterValue
} from "../controllers/counterController.js";

const router=express.Router();

router.post("/",createCounter);
router.get("/",getCounters);
router.post("/next",getNextCounterValue);
router.get("/:id",getCounterById);
router.put("/:id",updateCounter);
router.delete("/:id",deleteCounter);

export default router;