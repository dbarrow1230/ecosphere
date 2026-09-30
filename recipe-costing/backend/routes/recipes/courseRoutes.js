import controller from "../../controllers/recipes/courseController.js";
import {createReferenceCrudRouter} from "./referenceCrudRoutes.js";

export default createReferenceCrudRouter(controller);
