// backend/routes/reference/taskPriorityRoutes.js
import express from "express";
import {
createTaskPriority,
getTaskPriorities,
getTaskPriorityById,
updateTaskPriority,
deleteTaskPriority
} from "../../controllers/reference/taskPriorityController.js";

const router=express.Router();

router.post("/",createTaskPriority);
router.get("/",getTaskPriorities);
router.get("/:id",getTaskPriorityById);
router.put("/:id",updateTaskPriority);
router.delete("/:id",deleteTaskPriority);

export default router;