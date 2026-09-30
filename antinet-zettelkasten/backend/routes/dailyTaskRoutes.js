import express from "express";
import {listDailyTasks,getDailyTask,createDailyTask,updateDailyTask,deleteDailyTask} from "../controllers/dailyTaskController.js";

const router=express.Router();
router.route("/").get(listDailyTasks).post(createDailyTask);
router.route("/:id").get(getDailyTask).put(updateDailyTask).delete(deleteDailyTask);
export default router;
