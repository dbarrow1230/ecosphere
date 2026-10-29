// backend/routes/reference/soilTypeRoutes.js
import express from "express";
import {
createSoilType,
getSoilTypes,
getSoilTypeById,
updateSoilType,
deleteSoilType
} from "../../controllers/reference/soilTypeController.js";

const router=express.Router();

router.post("/",createSoilType);
router.get("/",getSoilTypes);
router.get("/:id",getSoilTypeById);
router.put("/:id",updateSoilType);
router.delete("/:id",deleteSoilType);

export default router;