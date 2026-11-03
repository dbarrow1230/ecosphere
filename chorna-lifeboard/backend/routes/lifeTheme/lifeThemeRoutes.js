import createCrudRoutes from "../utils/createCrudRoutes.js";
import lifeThemeController from "../../controllers/lifeTheme/lifeThemeController.js";

const router=createCrudRoutes(lifeThemeController);

export default router;