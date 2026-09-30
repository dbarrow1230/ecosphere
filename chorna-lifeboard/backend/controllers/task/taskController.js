// backend/controllers/task/taskController.js
import Task from "../../models/task/taskModel.js";
import createCrudController from "../utils/createCrudController.js";

const taskController=createCrudController({
 Model:Task,
 dataKey:"tasks",
 defaultSort:{dueDate:1,startDate:1,createdAt:-1},
 populate:"lifeArea category linkedGoal linkedHabit tags"
});

export default taskController;