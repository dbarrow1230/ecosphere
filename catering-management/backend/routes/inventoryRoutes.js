// backend/routes/inventoryRoutes.js
import express from "express";
import {createInventory,getInventory,getSingleInventory,updateInventory,deleteInventory} from "../controllers/inventoryController.js";

const router=express.Router();

router.post("/",createInventory);
router.get("/",getInventory);
router.get("/:id",getSingleInventory);
router.put("/:id",updateInventory);
router.delete("/:id",deleteInventory);

export default router;