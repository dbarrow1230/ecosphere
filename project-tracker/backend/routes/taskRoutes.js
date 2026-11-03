import express from "express";
import {listTasks,getTask,createTask,updateTask,deleteTask} from "../controllers/taskController.js";
const router=express.Router();
router.route("/").get(listTasks).post(createTask);
router.route("/:id").get(getTask).put(updateTask).patch(updateTask).delete(deleteTask);
export default router;
