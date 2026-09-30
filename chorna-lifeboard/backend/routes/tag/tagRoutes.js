// backend/routes/tag/tagRoutes.js
import createCrudRoutes from "../utils/createCrudRoutes.js";
import tagController from "../../controllers/tag/tagController.js";

const router=createCrudRoutes(tagController);

export default router;