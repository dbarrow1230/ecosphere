// backend/routes/reference/allergenRoutes.js
import express from "express";
import {
 getAllergens,
 getAllergenById,
 createAllergen,
 updateAllergen,
 deleteAllergen
} from "../../controllers/reference/allergenController.js";

const router=express.Router();

router.get("/",getAllergens);
router.get("/:id",getAllergenById);
router.post("/",createAllergen);
router.put("/:id",updateAllergen);
router.delete("/:id",deleteAllergen);

export default router;