//backend/routes/finance/pricingRoutes.js
import express from "express";
import {createPricing,getPricing,getPricingById,updatePricing,deletePricing} from "../../controllers/finance/pricingController.js";

const router=express.Router();

router.route("/")
 .post(createPricing)
 .get(getPricing);

router.route("/:id")
 .get(getPricingById)
 .put(updatePricing)
 .delete(deletePricing);

export default router;