// backend/routes/poetryFormRoutes.js
import express from "express";
import {
 getPoetryForms,
 getPoetryForm,
 createPoetryForm,
 updatePoetryForm,
 deletePoetryForm
} from "../controllers/poetryFormController.js";

const router=express.Router();

router.get("/",getPoetryForms);
router.get("/:id",getPoetryForm);
router.post("/",createPoetryForm);
router.put("/:id",updatePoetryForm);
router.delete("/:id",deletePoetryForm);

export default router;