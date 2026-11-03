// backend/routes/menuItemRoutes.js
import express from "express";
import {createMenuItem,getMenuItems,getSingleMenuItem,updateMenuItem,deleteMenuItem} from "../controllers/menuItemController.js";

const router=express.Router();

router.post("/",createMenuItem);
router.get("/",getMenuItems);
router.get("/:id",getSingleMenuItem);
router.put("/:id",updateMenuItem);
router.delete("/:id",deleteMenuItem);

export default router;