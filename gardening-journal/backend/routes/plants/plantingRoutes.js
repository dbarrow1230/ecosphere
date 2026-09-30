// backend/routes/plants/plantingRoutes.js
import express from "express";
import {
createPlanting,
getPlantings,
getPlantingById,
updatePlanting,
addPlantingNote,
deletePlanting
} from "../../controllers/plants/plantingController.js";

const router=express.Router();

router.post("/",createPlanting);
router.get("/",getPlantings);
router.get("/:id",getPlantingById);
router.put("/:id",updatePlanting);
router.patch("/:id/notes",addPlantingNote);
router.delete("/:id",deletePlanting);

export default router;