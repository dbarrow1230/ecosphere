import express from "express";
import {createInventoryItem,deleteInventoryItem,getInventory,getInventoryItemById,updateInventoryItem} from "../../controllers/operations/inventoryController.js";

const router=express.Router();
router.get("/",getInventory);
router.post("/",createInventoryItem);
router.get("/:id",getInventoryItemById);
router.put("/:id",updateInventoryItem);
router.delete("/:id",deleteInventoryItem);
export default router;
