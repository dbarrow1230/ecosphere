//backend/routes/inventory/inventoryLotRoutes.js
import express from "express";
import {createInventoryLot,getInventoryLots,getInventoryLotById,updateInventoryLot,deleteInventoryLot} from "../../controllers/inventory/inventoryLotController.js";

const router=express.Router();

router.post("/",createInventoryLot);
router.get("/",getInventoryLots);
router.get("/:id",getInventoryLotById);
router.put("/:id",updateInventoryLot);
router.delete("/:id",deleteInventoryLot);

export default router;