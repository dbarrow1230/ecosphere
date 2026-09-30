// backend/routes/inventoryTransactionRoutes.js
import express from "express";
import {createInventoryTransaction,getInventoryTransactions,getSingleInventoryTransaction,updateInventoryTransaction,deleteInventoryTransaction} from "../controllers/inventoryTransactionController.js";

const router=express.Router();

router.post("/",createInventoryTransaction);
router.get("/",getInventoryTransactions);
router.get("/:id",getSingleInventoryTransaction);
router.put("/:id",updateInventoryTransaction);
router.delete("/:id",deleteInventoryTransaction);

export default router;