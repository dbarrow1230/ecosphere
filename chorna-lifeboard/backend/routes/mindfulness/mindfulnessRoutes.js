import createCrudRoutes from "../utils/createCrudRoutes.js";
import mindfulnessController from "../../controllers/mindfulness/mindfulnessController.js";

const router=createCrudRoutes(mindfulnessController);

export default router;