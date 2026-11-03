import createCrudRoutes from "../utils/createCrudRoutes.js";
import categoryController from "../../controllers/category/categoryController.js";

const router=createCrudRoutes(categoryController);

export default router;