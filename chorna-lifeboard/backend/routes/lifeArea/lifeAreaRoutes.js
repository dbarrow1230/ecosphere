import createCrudRoutes from "../utils/createCrudRoutes.js";
import lifeAreaController from "../../controllers/lifeArea/lifeAreaController.js";

const router=createCrudRoutes(lifeAreaController);

export default router;