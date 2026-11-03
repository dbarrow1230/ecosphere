// backend/routes/archiveRoutes.js
import express from "express";
import{
 createArchive,
 getArchives,
 getArchiveById,
 updateArchive,
 deleteArchive
}from "../controllers/archiveController.js";

const router=express.Router();

router.post("/",createArchive);
router.get("/",getArchives);
router.get("/:id",getArchiveById);
router.put("/:id",updateArchive);
router.delete("/:id",deleteArchive);

export default router;