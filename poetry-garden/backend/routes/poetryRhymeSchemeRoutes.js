// backend/routes/poetryRhymeSchemeRoutes.js
import express from "express";
import {
 getPoetryRhymeSchemes,
 getPoetryRhymeScheme,
 createPoetryRhymeScheme,
 updatePoetryRhymeScheme,
 deletePoetryRhymeScheme
} from "../controllers/poetryRhymeSchemeController.js";

const router=express.Router();

router.get("/",getPoetryRhymeSchemes);
router.get("/:id",getPoetryRhymeScheme);
router.post("/",createPoetryRhymeScheme);
router.put("/:id",updatePoetryRhymeScheme);
router.delete("/:id",deletePoetryRhymeScheme);

export default router;