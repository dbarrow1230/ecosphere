import express from "express";
import {createInventoryItem,deleteInventoryItem,getInventoryItemById,getInventoryItems,updateInventoryItem} from "../../controllers/inventory/inventoryController.js";

const router=express.Router();

router.get("/",getInventoryItems);
router.get("/:id",getInventoryItemById);
router.post("/",createInventoryItem);
router.put("/:id",updateInventoryItem);
router.delete("/:id",deleteInventoryItem);

export default router;
