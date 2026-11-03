// backend/routes/plants/plantRoutes.js
import express from "express";
import {
createPlant,
getPlants,
getPlantById,
updatePlant,
addPlantNote,
deletePlant
} from "../../controllers/plants/plantController.js";

const router=express.Router();

router.post("/",createPlant);
router.get("/",getPlants);
router.get("/:id",getPlantById);
router.put("/:id",updatePlant);
router.patch("/:id/notes",addPlantNote);
router.delete("/:id",deletePlant);

export default router;