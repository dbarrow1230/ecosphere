// backend/routes/reference/harvestQualityScaleRoutes.js
import express from "express";
import {
createHarvestQualityScale,
getHarvestQualityScales,
getHarvestQualityScaleById,
updateHarvestQualityScale,
deleteHarvestQualityScale
} from "../../controllers/reference/harvestQualityScaleController.js";

const router=express.Router();

router.post("/",createHarvestQualityScale);
router.get("/",getHarvestQualityScales);
router.get("/:id",getHarvestQualityScaleById);
router.put("/:id",updateHarvestQualityScale);
router.delete("/:id",deleteHarvestQualityScale);

export default router;