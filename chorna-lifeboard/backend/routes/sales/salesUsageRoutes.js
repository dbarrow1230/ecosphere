//backend/routes/sales/salesUsageRoutes.js
import express from "express";
import {createSalesUsage,getSalesUsages,getSalesUsageById,updateSalesUsage,deleteSalesUsage} from "../../controllers/sales/salesUsageController.js";

const router=express.Router();

router.post("/",createSalesUsage);
router.get("/",getSalesUsages);
router.get("/:id",getSalesUsageById);
router.put("/:id",updateSalesUsage);
router.delete("/:id",deleteSalesUsage);

export default router;