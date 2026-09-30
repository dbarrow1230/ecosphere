// backend/routes/fertilizers/fertilizerApplicationRoutes.js
import express from "express";
import {
createFertilizerApplication,
getFertilizerApplications,
getFertilizerApplicationById,
updateFertilizerApplication,
deleteFertilizerApplication
} from "../../controllers/fertilizers/fertilizerApplicationController.js";

const router=express.Router();

router.post("/",createFertilizerApplication);
router.get("/",getFertilizerApplications);
router.get("/:id",getFertilizerApplicationById);
router.put("/:id",updateFertilizerApplication);
router.delete("/:id",deleteFertilizerApplication);

export default router;