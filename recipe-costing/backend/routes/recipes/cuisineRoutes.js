import controller from "../../controllers/recipes/cuisineController.js";
import {createReferenceCrudRouter} from "./referenceCrudRoutes.js";

export default createReferenceCrudRouter(controller);
