// backend/routes/menu/menuRoutes.js
import express from "express";
import {
 getMenus,
 getMenuById,
 createMenu,
 updateMenu,
 deleteMenu
} from "../../controllers/menu/menuController.js";

const router=express.Router();

router.get("/",getMenus);
router.get("/:id",getMenuById);
router.post("/",createMenu);
router.put("/:id",updateMenu);
router.delete("/:id",deleteMenu);

export default router;