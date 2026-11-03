import express from "express";
import {
 createCostModel,
 getCostModels,
 getCostModelById,
 updateCostModel,
 deleteCostModel
} from "../../controllers/costing/costModelController.js";

const router=express.Router();

router.post("/",createCostModel);
router.get("/",getCostModels);
router.get("/:id",getCostModelById);
router.put("/:id",updateCostModel);
router.delete("/:id",deleteCostModel);

export default router;