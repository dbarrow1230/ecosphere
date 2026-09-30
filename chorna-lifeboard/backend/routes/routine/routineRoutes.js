import createCrudRoutes from "../utils/createCrudRoutes.js";
import routineController from "../../controllers/routine/routineController.js";

const router=createCrudRoutes(routineController);

export default router;