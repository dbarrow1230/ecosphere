import controller from "../../controllers/recipes/dietaryController.js";
import {createReferenceCrudRouter} from "./referenceCrudRoutes.js";

export default createReferenceCrudRouter(controller);
