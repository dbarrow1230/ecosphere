import express from "express";
import {
 createMenteeFile,
 getMenteeFiles,
 getMenteeFileById,
 updateMenteeFile,
 deleteMenteeFile
} from "../controllers/menteeFileController.js";

const router=express.Router();

router.get("/",getMenteeFiles);
router.get("/list",getMenteeFiles);
router.post("/",createMenteeFile);
router.get("/:id",getMenteeFileById);
router.put("/:id",updateMenteeFile);
router.delete("/:id",deleteMenteeFile);

export default router;