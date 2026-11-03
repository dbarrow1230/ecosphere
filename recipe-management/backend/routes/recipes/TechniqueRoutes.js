import express from "express";
import {createTechnique,deleteTechnique,getTechniques,updateTechnique} from "../../controllers/recipes/TechniqueController.js";

const router=express.Router();
router.get("/",getTechniques);
router.post("/",createTechnique);
router.put("/:id",updateTechnique);
router.delete("/:id",deleteTechnique);
export default router;
