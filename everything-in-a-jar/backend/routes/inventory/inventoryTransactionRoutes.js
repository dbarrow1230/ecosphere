//backend/routes/inventory/inventoryTransactionRoutes.js
import express from "express";
import {createInventoryTransaction,getInventoryTransactions,getInventoryTransactionById,deleteInventoryTransaction} from "../../controllers/inventory/inventoryTransactionController.js";

const router=express.Router();

router.post("/",createInventoryTransaction);
router.get("/",getInventoryTransactions);
router.get("/:id",getInventoryTransactionById);
router.delete("/:id",deleteInventoryTransaction);

export default router;