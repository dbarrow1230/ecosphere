// backend/routes/studies/studyTaskRoutes.js
import express from "express";
import {
 getStudyTasks,
 getStudyTaskById,
 createStudyTask,
 updateStudyTask,
 deleteStudyTask
} from "../../controllers/studies/studyTaskController.js";

const router=express.Router();

router.get("/",getStudyTasks);
router.get("/:id",getStudyTaskById);
router.post("/",createStudyTask);
router.put("/:id",updateStudyTask);
router.delete("/:id",deleteStudyTask);

export default router;