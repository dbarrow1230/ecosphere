// backend/routes/taskRoutes.js
import express from "express";
import {createTask,getTasks,getSingleTask,updateTask,deleteTask} from "../controllers/taskController.js";

const router=express.Router();

router.post("/",createTask);
router.get("/",getTasks);
router.get("/:id",getSingleTask);
router.put("/:id",updateTask);
router.delete("/:id",deleteTask);

export default router;