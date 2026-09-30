//backend/routes/sales/salesUsageLineRoutes.js
import express from "express";
import {createSalesUsageLine,getSalesUsageLines,getSalesUsageLineById,updateSalesUsageLine,deleteSalesUsageLine} from "../../controllers/sales/salesUsageLineController.js";

const router=express.Router();

router.post("/",createSalesUsageLine);
router.get("/",getSalesUsageLines);
router.get("/:id",getSalesUsageLineById);
router.put("/:id",updateSalesUsageLine);
router.delete("/:id",deleteSalesUsageLine);

export default router;