import express from "express";
import {
 getRadioTerms,
 getRadioTerm,
 createRadioTerm,
 updateRadioTerm,
 deleteRadioTerm
} from "../../controllers/reference/radioTermController.js";

const router=express.Router();

router.get("/",getRadioTerms);
router.get("/:id",getRadioTerm);
router.post("/",createRadioTerm);
router.put("/:id",updateRadioTerm);
router.delete("/:id",deleteRadioTerm);

export default router;