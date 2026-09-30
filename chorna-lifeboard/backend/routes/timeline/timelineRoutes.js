import createCrudRoutes from "../utils/createCrudRoutes.js";
import timelineController from "../../controllers/timeline/timelineController.js";

const router=createCrudRoutes(timelineController);

export default router;