// backend/routes/reference/taskStatusRoutes.js
import express from "express";
import {
createTaskStatus,
getTaskStatuses,
getTaskStatusById,
updateTaskStatus,
deleteTaskStatus
} from "../../controllers/reference/taskStatusController.js";

const router=express.Router();

router.post("/",createTaskStatus);
router.get("/",getTaskStatuses);
router.get("/:id",getTaskStatusById);
router.put("/:id",updateTaskStatus);
router.delete("/:id",deleteTaskStatus);

export default router;