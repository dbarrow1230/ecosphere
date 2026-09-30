import express from "express";
import {
 createInventoryItem,
 getInventoryItems,
 getInventoryItemById,
 updateInventoryItem,
 deleteInventoryItem
} from "../../controllers/inventory/inventoryItemController.js";

const router=express.Router();

router.post("/",createInventoryItem);
router.get("/",getInventoryItems);
router.get("/:id",getInventoryItemById);
router.put("/:id",updateInventoryItem);
router.delete("/:id",deleteInventoryItem);

export default router;
