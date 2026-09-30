// backend/routes/lookups/taskStatusRoutes.js
import express from "express";
import {
 getTaskStatuses,
 getTaskStatusById,
 createTaskStatus,
 updateTaskStatus,
 deleteTaskStatus
} from "../../controllers/lookups/taskStatusController.js";

const router=express.Router();

router.get("/",getTaskStatuses);
router.get("/:id",getTaskStatusById);
router.post("/",createTaskStatus);
router.put("/:id",updateTaskStatus);
router.delete("/:id",deleteTaskStatus);

export default router;