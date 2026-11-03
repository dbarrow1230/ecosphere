//backend/routes/returns/vendorReturnRoutes.js
import express from "express";
import {createVendorReturn,getVendorReturns,getVendorReturnById,updateVendorReturn,deleteVendorReturn,updateVendorReturnStatus} from "../../controllers/returns/vendorReturnController.js";

const router=express.Router();

router.post("/",createVendorReturn);
router.get("/",getVendorReturns);
router.get("/:id",getVendorReturnById);
router.put("/:id",updateVendorReturn);
router.patch("/:id/status",updateVendorReturnStatus);
router.delete("/:id",deleteVendorReturn);

export default router;