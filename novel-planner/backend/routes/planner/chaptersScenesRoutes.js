// backend/routes/planner/chaptersScenesRoutes.js
import express from "express";
import {
 getChaptersScenes,
 getChaptersScenesById,
 saveChaptersScenes,
 updateChaptersScenes,
 archiveChaptersScenes
} from "../../controllers/planner/chaptersScenesController.js";

const router=express.Router();

router.get("/",getChaptersScenes);
router.get("/:id",getChaptersScenesById);
router.post("/",saveChaptersScenes);
router.put("/:id",updateChaptersScenes);
router.patch("/:id/archive",archiveChaptersScenes);

export default router;