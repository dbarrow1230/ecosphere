//backend/routes/consulting/projectRoutes.js
import express from "express";
import{
 createProject,
 getProjects,
 getProjectById,
 updateProject,
 deleteProject,
 toggleProjectStatus
}from "../../controllers/consulting/projectController.js";

const router=express.Router();

router.post("/",createProject);
router.get("/",getProjects);
router.get("/:id",getProjectById);
router.put("/:id",updateProject);
router.patch("/:id/toggle-active",toggleProjectStatus);
router.delete("/:id",deleteProject);

export default router;