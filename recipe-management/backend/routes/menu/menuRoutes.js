import express from "express";
import {createMenu,deleteMenu,getMenus,updateMenu} from "../../controllers/menu/menuController.js";

const router=express.Router();
router.get("/",getMenus);
router.post("/",createMenu);
router.put("/:id",updateMenu);
router.delete("/:id",deleteMenu);
export default router;
