// backend/routes/reference/plantTypeRoutes.js
import express from "express";
import {
createPlantType,
getPlantTypes,
getPlantTypeById,
updatePlantType,
deletePlantType
} from "../../controllers/reference/plantTypeController.js";

const router=express.Router();

router.post("/",createPlantType);
router.get("/",getPlantTypes);
router.get("/:id",getPlantTypeById);
router.put("/:id",updatePlantType);
router.delete("/:id",deletePlantType);

export default router;