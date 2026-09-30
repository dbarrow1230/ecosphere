import express from "express";
import {createMenu,deleteMenu,getMenuById,getMenus,getPublicMenu,updateMenu} from "../../controllers/master/MenuController.js";

const router=express.Router();

router.get("/public",getPublicMenu);
router.get("/",getMenus);
router.post("/",createMenu);
router.get("/:id",getMenuById);
router.put("/:id",updateMenu);
router.delete("/:id",deleteMenu);

export default router;
