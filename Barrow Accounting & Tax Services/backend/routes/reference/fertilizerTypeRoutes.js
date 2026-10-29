// backend/routes/reference/fertilizerTypeRoutes.js
import express from "express";
import {
createFertilizerType,
getFertilizerTypes,
getFertilizerTypeById,
updateFertilizerType,
deleteFertilizerType
} from "../../controllers/reference/fertilizerTypeController.js";

const router=express.Router();

router.post("/",createFertilizerType);
router.get("/",getFertilizerTypes);
router.get("/:id",getFertilizerTypeById);
router.put("/:id",updateFertilizerType);
router.delete("/:id",deleteFertilizerType);

export default router;