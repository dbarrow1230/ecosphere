import controller from "../../controllers/recipes/vendorCategoryController.js";
import {createReferenceCrudRouter} from "./referenceCrudRoutes.js";

export default createReferenceCrudRouter(controller);
