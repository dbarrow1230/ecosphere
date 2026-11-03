// backend/routes/pests/pestTypeRoutes.js
import express from "express";
import {
createPestType,
getPestTypes,
getPestTypeById,
updatePestType,
deletePestType
} from "../../controllers/pests/pestTypeController.js";

const router=express.Router();

router.post("/",createPestType);
router.get("/",getPestTypes);
router.get("/:id",getPestTypeById);
router.put("/:id",updatePestType);
router.delete("/:id",deletePestType);

export default router;