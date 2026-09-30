import express from "express";
import {
 getAntennaReferences,
 getAntennaReference,
 createAntennaReference,
 updateAntennaReference,
 deleteAntennaReference
} from "../../controllers/reference/antennaReferenceController.js";

const router=express.Router();

router.get("/",getAntennaReferences);
router.get("/:id",getAntennaReference);
router.post("/",createAntennaReference);
router.put("/:id",updateAntennaReference);
router.delete("/:id",deleteAntennaReference);

export default router;