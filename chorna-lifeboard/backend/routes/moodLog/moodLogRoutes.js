import createCrudRoutes from "../utils/createCrudRoutes.js";
import moodLogController from "../../controllers/moodLog/moodLogController.js";

const router=createCrudRoutes(moodLogController);

export default router;