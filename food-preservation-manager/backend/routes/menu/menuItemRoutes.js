// backend/routes/menu/menuItemRoutes.js
import express from "express";
import {
 getMenuItems,
 getMenuItemById,
 createMenuItem,
 updateMenuItem,
 deleteMenuItem
} from "../../controllers/menu/menuItemController.js";

const router=express.Router();

router.get("/",getMenuItems);
router.get("/:id",getMenuItemById);
router.post("/",createMenuItem);
router.put("/:id",updateMenuItem);
router.delete("/:id",deleteMenuItem);

export default router;