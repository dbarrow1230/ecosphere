// backend/routes/FileTypeRoutes.js
import express from "express";
import {createFileType,getFileTypes,getFileTypeById,updateFileType,deleteFileType} from "../controllers/FileTypeController.js";

const router=express.Router();

router.post("/",createFileType);
router.get("/",getFileTypes);
router.get("/:id",getFileTypeById);
router.put("/:id",updateFileType);
router.delete("/:id",deleteFileType);

export default router;