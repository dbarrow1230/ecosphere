import createCrudRoutes from "../utils/createCrudRoutes.js";
import calendarEventController from "../../controllers/calendarEvent/calendarEventController.js";

const router=createCrudRoutes(calendarEventController);

export default router;