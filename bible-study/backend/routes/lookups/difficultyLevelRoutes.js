// backend/routes/lookups/difficultyLevelRoutes.js
import express from "express";
import {
 getDifficultyLevels,
 getDifficultyLevelById,
 createDifficultyLevel,
 updateDifficultyLevel,
 deleteDifficultyLevel
} from "../../controllers/lookups/difficultyLevelController.js";

const router=express.Router();

router.get("/",getDifficultyLevels);
router.get("/:id",getDifficultyLevelById);
router.post("/",createDifficultyLevel);
router.put("/:id",updateDifficultyLevel);
router.delete("/:id",deleteDifficultyLevel);

export default router;