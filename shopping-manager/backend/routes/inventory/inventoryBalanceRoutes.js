//backend/routes/inventory/inventoryBalanceRoutes.js
import express from "express";
import {createInventoryBalance,getInventoryBalances,getInventoryBalanceById,updateInventoryBalance,deleteInventoryBalance} from "../../controllers/inventory/inventoryBalanceController.js";

const router=express.Router();

router.post("/",createInventoryBalance);
router.get("/",getInventoryBalances);
router.get("/:id",getInventoryBalanceById);
router.put("/:id",updateInventoryBalance);
router.delete("/:id",deleteInventoryBalance);

export default router;