import express from "express";
import {
 getProjects,
 getProjectById,
 createProject,
 updateProject,
 archiveProject,
 restoreProject,
 toggleFavoriteProject,
 deleteProject
} from "../controllers/projectController.js";

const router=express.Router();

router.route("/")
 .get(getProjects)
 .post(createProject);

router.patch("/:id/archive",archiveProject);
router.patch("/:id/restore",restoreProject);
router.patch("/:id/favorite",toggleFavoriteProject);

router.route("/:id")
 .get(getProjectById)
 .put(updateProject)
 .delete(deleteProject);

export default router;
