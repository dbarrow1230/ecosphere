import express from "express";
import {
 getTechnicalReferences,
 getTechnicalReference,
 createTechnicalReference,
 updateTechnicalReference,
 deleteTechnicalReference
} from "../../controllers/reference/technicalReferenceController.js";

const router=express.Router();

router.get("/",getTechnicalReferences);
router.get("/:id",getTechnicalReference);
router.post("/",createTechnicalReference);
router.put("/:id",updateTechnicalReference);
router.delete("/:id",deleteTechnicalReference);

export default router;