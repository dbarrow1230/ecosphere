import createCrudRoutes from "../utils/createCrudRoutes.js";
import reminderController from "../../controllers/reminders/reminderController.js";

const router=createCrudRoutes(reminderController);

export default router;