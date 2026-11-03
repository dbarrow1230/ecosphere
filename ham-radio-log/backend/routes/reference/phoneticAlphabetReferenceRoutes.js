import express from "express";
import {
 getPhoneticAlphabetReferences,
 getPhoneticAlphabetReference,
 createPhoneticAlphabetReference,
 updatePhoneticAlphabetReference,
 deletePhoneticAlphabetReference
} from "../../controllers/reference/phoneticAlphabetReferenceController.js";

const router=express.Router();

router.get("/",getPhoneticAlphabetReferences);
router.get("/:id",getPhoneticAlphabetReference);
router.post("/",createPhoneticAlphabetReference);
router.put("/:id",updatePhoneticAlphabetReference);
router.delete("/:id",deletePhoneticAlphabetReference);

export default router;