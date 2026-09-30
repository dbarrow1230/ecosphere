import controller from "../../controllers/recipes/vendorIngredientPriceController.js";
import {createReferenceCrudRouter} from "./referenceCrudRoutes.js";

export default createReferenceCrudRouter(controller);
