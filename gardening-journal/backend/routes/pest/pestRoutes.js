// backend/routes/pests/pestRoutes.js
import express from "express";
import {
createPest,
getPests,
getPestById,
updatePest,
deletePest
} from "../../controllers/pests/pestController.js";

const router=express.Router();

router.post("/",createPest);
router.get("/",getPests);
router.get("/:id",getPestById);
router.put("/:id",updatePest);
router.delete("/:id",deletePest);

export default router;