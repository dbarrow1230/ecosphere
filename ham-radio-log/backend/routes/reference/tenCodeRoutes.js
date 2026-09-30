import express from "express";
import {
 getTenCodes,
 getTenCode,
 createTenCode,
 updateTenCode,
 deleteTenCode
} from "../../controllers/reference/tenCodeController.js";

const router=express.Router();

router.get("/",getTenCodes);
router.get("/:id",getTenCode);
router.post("/",createTenCode);
router.put("/:id",updateTenCode);
router.delete("/:id",deleteTenCode);

export default router;