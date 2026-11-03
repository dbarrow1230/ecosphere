// backend/routes/reference/conditionScaleRoutes.js
import express from "express";
import {
createConditionScale,
getConditionScales,
getConditionScaleById,
updateConditionScale,
deleteConditionScale
} from "../../controllers/reference/conditionScaleController.js";

const router=express.Router();

router.post("/",createConditionScale);
router.get("/",getConditionScales);
router.get("/:id",getConditionScaleById);
router.put("/:id",updateConditionScale);
router.delete("/:id",deleteConditionScale);

export default router;