//backend/routes/beverages/beverageItemRoutes.js
import express from "express";
import {createBeverageItem,getBeverageItems,getBeverageItemById,updateBeverageItem,deleteBeverageItem,toggleBeverageItemStatus} from "../../controllers/beverages/beverageItemController.js";

const router=express.Router();

router.post("/",createBeverageItem);
router.get("/",getBeverageItems);
router.get("/:id",getBeverageItemById);
router.put("/:id",updateBeverageItem);
router.patch("/:id/toggle-status",toggleBeverageItemStatus);
router.delete("/:id",deleteBeverageItem);

export default router;