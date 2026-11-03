// backend/routes/task/taskRoutes.js
import createCrudRoutes from "../utils/createCrudRoutes.js";
import taskController from "../../controllers/task/taskController.js";

const router=createCrudRoutes(taskController);

export default router;