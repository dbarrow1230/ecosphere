// backend/routes/menu/occasionRoutes.js
import express from "express";
import {
 createOccasion,
 getOccasions,
 getOccasionById,
 updateOccasion,
 deleteOccasion
} from "../../controllers/menu/occasionController.js";

const router=express.Router();

router.post("/",createOccasion);
router.get("/",getOccasions);
router.get("/:id",getOccasionById);
router.put("/:id",updateOccasion);
router.delete("/:id",deleteOccasion);

export default router;