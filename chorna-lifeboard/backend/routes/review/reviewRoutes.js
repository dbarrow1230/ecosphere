import createCrudRoutes from "../utils/createCrudRoutes.js";
import reviewController from "../../controllers/review/reviewController.js";

const router=createCrudRoutes(reviewController);

export default router;