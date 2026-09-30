// backend/routes/reference/taxRateRoutes.js
import express from "express";
import {
 getTaxRates,
 getTaxRateById,
 createTaxRate,
 updateTaxRate,
 deleteTaxRate
} from "../../controllers/reference/taxRateController.js";

const router=express.Router();

router.get("/",getTaxRates);
router.get("/:id",getTaxRateById);
router.post("/",createTaxRate);
router.put("/:id",updateTaxRate);
router.delete("/:id",deleteTaxRate);

export default router;