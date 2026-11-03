// backend/routes/studies/crossReferenceRoutes.js
import express from "express";
import {
 getCrossReferences,
 getCrossReferenceById,
 createCrossReference,
 updateCrossReference,
 deleteCrossReference
} from "../../controllers/studies/crossReferenceController.js";

const router=express.Router();

router.get("/",getCrossReferences);
router.get("/:id",getCrossReferenceById);
router.post("/",createCrossReference);
router.put("/:id",updateCrossReference);
router.delete("/:id",deleteCrossReference);

export default router;