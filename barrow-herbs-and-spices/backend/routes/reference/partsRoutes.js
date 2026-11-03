// backend/routes/reference/partsRoutes.js
import express from "express";
import {createPart,getParts,getPartById,updatePart,deletePart} from "../../controllers/reference/partsController.js";

const router=express.Router();

router.post("/",createPart);
router.get("/",getParts);
router.get("/:id",getPartById);
router.put("/:id",updatePart);
router.delete("/:id",deletePart);

export default router;