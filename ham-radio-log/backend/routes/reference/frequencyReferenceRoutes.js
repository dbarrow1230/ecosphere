import express from "express";
import {
 getFrequencyReferences,
 createFrequencyReference,
 updateFrequencyReference,
 deleteFrequencyReference
} from "../../controllers/reference/frequencyReferenceController.js";

const router=express.Router();

router.get("/",getFrequencyReferences);
router.post("/",createFrequencyReference);
router.put("/:id",updateFrequencyReference);
router.delete("/:id",deleteFrequencyReference);

export default router;