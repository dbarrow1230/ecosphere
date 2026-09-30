//backend/routes/returns/vendorReturnLineRoutes.js
import express from "express";
import {createVendorReturnLine,getVendorReturnLines,getVendorReturnLineById,updateVendorReturnLine,deleteVendorReturnLine} from "../../controllers/returns/vendorReturnLineController.js";

const router=express.Router();

router.post("/",createVendorReturnLine);
router.get("/",getVendorReturnLines);
router.get("/:id",getVendorReturnLineById);
router.put("/:id",updateVendorReturnLine);
router.delete("/:id",deleteVendorReturnLine);

export default router;