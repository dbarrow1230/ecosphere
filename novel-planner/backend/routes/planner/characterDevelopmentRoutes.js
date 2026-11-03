// backend/routes/planner/characterDevelopmentRoutes.js
import express from "express";
import {
 getCharacterDevelopment,
 getCharacterDevelopmentById,
 saveCharacterDevelopment,
 updateCharacterDevelopment,
 archiveCharacterDevelopment
} from "../../controllers/planner/characterDevelopmentController.js";

const router=express.Router();

router.get("/",getCharacterDevelopment);
router.get("/:id",getCharacterDevelopmentById);
router.post("/",saveCharacterDevelopment);
router.put("/:id",updateCharacterDevelopment);
router.patch("/:id/archive",archiveCharacterDevelopment);

export default router;