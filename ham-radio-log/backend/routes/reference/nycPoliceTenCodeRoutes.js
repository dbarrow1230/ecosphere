import express from "express";
import {
 getNycPoliceTenCodes,
 getNycPoliceTenCode,
 createNycPoliceTenCode,
 updateNycPoliceTenCode,
 deleteNycPoliceTenCode
} from "../../controllers/reference/operationalCodeController.js";

const router=express.Router();

router.get("/",getNycPoliceTenCodes);
router.get("/:id",getNycPoliceTenCode);
router.post("/",createNycPoliceTenCode);
router.put("/:id",updateNycPoliceTenCode);
router.delete("/:id",deleteNycPoliceTenCode);

export default router;