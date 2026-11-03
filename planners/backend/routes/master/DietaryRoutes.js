// backend/routes/master/DietaryRoutes.js
import express from "express";
import {createDietary,getDietaries,getDietaryById,updateDietary,deleteDietary} from "../../controllers/master/DietaryController.js";

const router=express.Router();

router.post("/",createDietary);
router.get("/",getDietaries);
router.get("/:id",getDietaryById);
router.put("/:id",updateDietary);
router.delete("/:id",deleteDietary);

export default router;