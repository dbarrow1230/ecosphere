import Dietary from "../../models/recipes/DietaryModel.js";
import {createReferenceCrudController} from "./referenceCrudController.js";

export default createReferenceCrudController(Dietary,"Dietary item");
