// backend/routes/lookups/taskPriorityRoutes.js
import express from "express";
import {
 getTaskPriorities,
 getTaskPriorityById,
 createTaskPriority,
 updateTaskPriority,
 deleteTaskPriority
} from "../../controllers/lookups/taskPriorityController.js";

const router=express.Router();

router.get("/",getTaskPriorities);
router.get("/:id",getTaskPriorityById);
router.post("/",createTaskPriority);
router.put("/:id",updateTaskPriority);
router.delete("/:id",deleteTaskPriority);

export default router;