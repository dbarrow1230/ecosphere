import Category from "../../models/recipes/CategoryModel.js";
import {createReferenceCrudController} from "./referenceCrudController.js";

export default createReferenceCrudController(Category,"Category");
