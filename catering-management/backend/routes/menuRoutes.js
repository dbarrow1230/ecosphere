// backend/routes/menuRoutes.js
import express from "express";
import {createMenu,getMenus,getSingleMenu,updateMenu,deleteMenu} from "../controllers/menuController.js";

const router=express.Router();

router.post("/",createMenu);
router.get("/",getMenus);
router.get("/:id",getSingleMenu);
router.put("/:id",updateMenu);
router.delete("/:id",deleteMenu);

export default router;