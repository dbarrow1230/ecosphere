import createCrudRoutes from "../utils/createCrudRoutes.js";
import habitController from "../../controllers/habit/habitController.js";

const router=createCrudRoutes(habitController);

export default router;