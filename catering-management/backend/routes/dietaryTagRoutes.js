import express from "express";
import {getDietaryTags,getDietaryTagById,createDietaryTag,updateDietaryTag,deleteDietaryTag} from "../controllers/dietaryTagController.js";

const router=express.Router();

router.get("/",getDietaryTags);
router.get("/:id",getDietaryTagById);
router.post("/",createDietaryTag);
router.put("/:id",updateDietaryTag);
router.delete("/:id",deleteDietaryTag);

export default router;