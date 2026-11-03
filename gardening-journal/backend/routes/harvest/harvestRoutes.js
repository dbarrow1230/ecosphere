// backend/routes/harvest/harvestRoutes.js
import express from "express";
import {
createHarvest,
getHarvests,
getHarvestById,
updateHarvest,
addHarvestNote,
deleteHarvest
} from "../../controllers/harvest/harvestController.js";

const router=express.Router();

router.post("/",createHarvest);
router.get("/",getHarvests);
router.get("/:id",getHarvestById);
router.put("/:id",updateHarvest);
router.patch("/:id/notes",addHarvestNote);
router.delete("/:id",deleteHarvest);

export default router;