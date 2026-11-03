import express from "express";
import {
 getProjectTypes,
 getProjectTypeById,
 createProjectType,
 updateProjectType,
 archiveProjectType,
 deleteProjectType
} from "../controllers/projectTypeController.js";

const router=express.Router();

router.route("/")
 .get(getProjectTypes)
 .post(createProjectType);

router.patch("/:id/archive",archiveProjectType);

router.route("/:id")
 .get(getProjectTypeById)
 .put(updateProjectType)
 .delete(deleteProjectType);

export default router;