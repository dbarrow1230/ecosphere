import Cuisine from "../../models/recipes/CuisineModel.js";
import {createReferenceCrudController} from "./referenceCrudController.js";

export default createReferenceCrudController(Cuisine,"Cuisine");
