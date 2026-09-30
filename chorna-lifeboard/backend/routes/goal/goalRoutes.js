import createCrudRoutes from "../utils/createCrudRoutes.js";
import goalController from "../../controllers/goal/goalController.js";

const router=createCrudRoutes(goalController);

export default router;