// backend/routes/referenceRoutes.js
import express from "express";
import{
 createReference,
 getReferences,
 getReferenceById,
 updateReference,
 deleteReference
}from "../controllers/referenceController.js";

const router=express.Router();

router.post("/",createReference);
router.get("/",getReferences);
router.get("/:id",getReferenceById);
router.put("/:id",updateReference);
router.delete("/:id",deleteReference);

export default router;