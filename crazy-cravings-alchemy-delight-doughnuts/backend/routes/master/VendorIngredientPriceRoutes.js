// backend/routes/master/VendorIngredientPriceRoutes.js
import express from "express";
import {createVendorIngredientPrice,getVendorIngredientPrices,getVendorIngredientPriceById,updateVendorIngredientPrice,deleteVendorIngredientPrice} from "../../controllers/master/VendorIngredientPriceController.js";

const router=express.Router();

router.post("/",createVendorIngredientPrice);
router.get("/",getVendorIngredientPrices);
router.get("/:id",getVendorIngredientPriceById);
router.put("/:id",updateVendorIngredientPrice);
router.delete("/:id",deleteVendorIngredientPrice);

export default router;