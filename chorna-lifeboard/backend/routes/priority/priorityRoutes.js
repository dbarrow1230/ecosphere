import createCrudRoutes from "../utils/createCrudRoutes.js";
import priorityController from "../../controllers/priority/priorityController.js";

const router=createCrudRoutes(priorityController);

export default router;