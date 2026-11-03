// backend/routes/menu/menuItemRoutes.js
import express from "express";
import {
 createMenuItem,
 getMenuItems,
 getMenuItemById,
 updateMenuItem,
 deleteMenuItem
} from "../../controllers/menu/menuItemController.js";

const router=express.Router();

router.post("/",createMenuItem);
router.get("/",getMenuItems);
router.get("/:id",getMenuItemById);
router.put("/:id",updateMenuItem);
router.delete("/:id",deleteMenuItem);

export default router;