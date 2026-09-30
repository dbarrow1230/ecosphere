import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {requestAccess} from "../middleware/requestAccess.js";
import {listInventory,getInventory,saveInventory,retireInventory} from "../controllers/inventoryController.js";
const router=express.Router();router.use(protect,requestAccess);
router.get("/",listInventory);router.post("/",saveInventory);router.get("/:id",getInventory);router.put("/:id",saveInventory);router.delete("/:id",retireInventory);
export default router;
