import express from "express";
import {listProjects,getProject,createProject,updateProject,deleteProject} from "../controllers/projectController.js";
const router=express.Router();
router.route("/").get(listProjects).post(createProject);
router.route("/:id").get(getProject).put(updateProject).patch(updateProject).delete(deleteProject);
export default router;
