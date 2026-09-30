import express from "express";
import multer from "multer";
import {importRecipeBookDrafts,parseRecipeBookFile,parseRecipeTextDraft} from "../../controllers/recipes/RecipeImportController.js";

const router=express.Router();
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:30*1024*1024}});

router.post("/parse",upload.single("file"),parseRecipeBookFile);
router.post("/parse-text",parseRecipeTextDraft);
router.post("/import",importRecipeBookDrafts);

export default router;
