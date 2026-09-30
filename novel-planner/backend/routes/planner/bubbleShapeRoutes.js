// backend/routes/planner/bubbleShapeRoutes.js
import express from "express";
import {
 getBubbleShapes,
 getBubbleShapeById,
 createBubbleShape,
 updateBubbleShape,
 archiveBubbleShape,
 deleteBubbleShape
} from "../../controllers/planner/bubbleShapeController.js";

const router=express.Router();

router.get("/",getBubbleShapes);
router.get("/:id",getBubbleShapeById);
router.post("/",createBubbleShape);
router.put("/:id",updateBubbleShape);
router.patch("/:id/archive",archiveBubbleShape);
router.delete("/:id",deleteBubbleShape);

export default router;