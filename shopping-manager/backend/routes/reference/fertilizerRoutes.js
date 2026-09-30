// backend/routes/reference/fertilizerRoutes.js
import express from "express";
import {
createFertilizer,
getFertilizers,
getFertilizerById,
updateFertilizer,
deleteFertilizer
} from "../../controllers/reference/fertilizerController.js";

const router=express.Router();

router.post("/",createFertilizer);
router.get("/",getFertilizers);
router.get("/:id",getFertilizerById);
router.put("/:id",updateFertilizer);
router.delete("/:id",deleteFertilizer);

export default router;