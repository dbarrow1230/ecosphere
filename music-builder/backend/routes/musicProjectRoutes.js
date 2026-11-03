import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {createMusicProject,getMusicProjects,getMusicProjectById,updateMusicProject,deleteMusicProject} from "../controllers/musicProjectController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getMusicProjects).post(createMusicProject);
router.route("/:id").get(getMusicProjectById).put(updateMusicProject).patch(updateMusicProject).delete(deleteMusicProject);
export default router;
