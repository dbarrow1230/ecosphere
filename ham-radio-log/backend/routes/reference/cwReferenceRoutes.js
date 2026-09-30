import express from "express";
import {
 getCwReferences,
 getCwReference,
 createCwReference,
 updateCwReference,
 deleteCwReference
} from "../../controllers/reference/cwReferenceController.js";

const router=express.Router();

router.get("/",getCwReferences);
router.get("/:id",getCwReference);
router.post("/",createCwReference);
router.put("/:id",updateCwReference);
router.delete("/:id",deleteCwReference);

export default router;