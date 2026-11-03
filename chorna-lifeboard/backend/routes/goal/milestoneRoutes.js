import createCrudRoutes from "../utils/createCrudRoutes.js";
import milestoneController from "../../controllers/goal/milestoneController.js";

const router=createCrudRoutes(milestoneController);

export default router;