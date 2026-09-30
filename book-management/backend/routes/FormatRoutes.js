// backend/routes/FormatRoutes.js
import express from "express";
import {createFormat,getFormats,getFormatById,updateFormat,deleteFormat} from "../controllers/FormatController.js";

const router=express.Router();

router.post("/",createFormat);
router.get("/",getFormats);
router.get("/:id",getFormatById);
router.put("/:id",updateFormat);
router.delete("/:id",deleteFormat);

export default router;