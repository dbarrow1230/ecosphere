// backend/routes/habits/habitLogRoutes.js
import createCrudRoutes from "../utils/createCrudRoutes.js";
import habitLogController from "../../controllers/habit/habitLogController.js";

const router=createCrudRoutes(habitLogController);

export default router;