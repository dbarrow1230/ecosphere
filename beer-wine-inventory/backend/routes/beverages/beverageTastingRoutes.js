// backend/routes/beverages/beverageTastingRoutes.js
import express from "express";
import {
    createBeverageTasting,
    getBeverageTastings,
    getBeverageTastingById,
    updateBeverageTasting,
    deleteBeverageTasting
} from "../../controllers/beverages/beverageTastingController.js";
const router=express.Router();
router.post("/",createBeverageTasting);
router.get("/",getBeverageTastings);
router.get("/:id",getBeverageTastingById);
router.put("/:id",updateBeverageTasting);
router.delete("/:id",deleteBeverageTasting);
export default router;