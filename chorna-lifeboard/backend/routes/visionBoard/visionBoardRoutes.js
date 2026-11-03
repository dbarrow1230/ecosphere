import createCrudRoutes from "../utils/createCrudRoutes.js";
import visionBoardController from "../../controllers/visionBoard/visionBoardController.js";

const router=createCrudRoutes(visionBoardController);

export default router;