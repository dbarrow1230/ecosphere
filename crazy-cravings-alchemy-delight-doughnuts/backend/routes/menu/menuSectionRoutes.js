// backend/routes/menu/menuSectionRoutes.js
import express from "express";
import {
 createMenuSection,
 getMenuSections,
 getMenuSectionById,
 updateMenuSection,
 deleteMenuSection
} from "../../controllers/menu/menuSectionController.js";

const router=express.Router();

router.post("/",createMenuSection);
router.get("/",getMenuSections);
router.get("/:id",getMenuSectionById);
router.put("/:id",updateMenuSection);
router.delete("/:id",deleteMenuSection);

export default router;