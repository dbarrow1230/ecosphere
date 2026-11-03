//backend/routes/beverages/beverageVendorItemRoutes.js
import express from "express";
import {createBeverageVendorItem,getBeverageVendorItems,getBeverageVendorItemById,updateBeverageVendorItem,deleteBeverageVendorItem,toggleBeverageVendorItemStatus} from "../../controllers/beverages/beverageVendorItemController.js";

const router=express.Router();

router.post("/",createBeverageVendorItem);
router.get("/",getBeverageVendorItems);
router.get("/:id",getBeverageVendorItemById);
router.put("/:id",updateBeverageVendorItem);
router.patch("/:id/toggle-status",toggleBeverageVendorItemStatus);
router.delete("/:id",deleteBeverageVendorItem);

export default router;