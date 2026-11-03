// backend/routes/reference/lightingRoutes.js
import express from "express";
import {
createLighting,
getLighting,
getLightingById,
updateLighting,
deleteLighting
} from "../../controllers/reference/lightingController.js";

const router=express.Router();

router.post("/",createLighting);
router.get("/",getLighting);
router.get("/:id",getLightingById);
router.put("/:id",updateLighting);
router.delete("/:id",deleteLighting);

export default router;