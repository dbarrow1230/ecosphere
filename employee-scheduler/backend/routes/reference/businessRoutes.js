// backend/routes/reference/businessRoutes.js
import express from "express";
import {createBusiness,getBusinesses,getBusinessById,updateBusiness,toggleBusinessReceipts,deleteBusiness} from "../../controllers/reference/businessController.js";

const router=express.Router();

router.post("/",createBusiness);
router.get("/",getBusinesses);
router.get("/:id",getBusinessById);
router.put("/:id",updateBusiness);
router.patch("/:id/receipts-enabled",toggleBusinessReceipts);
router.delete("/:id",deleteBusiness);

export default router;