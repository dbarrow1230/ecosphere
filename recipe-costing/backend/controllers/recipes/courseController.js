import Course from "../../models/recipes/CourseModel.js";
import {createReferenceCrudController} from "./referenceCrudController.js";

export default createReferenceCrudController(Course,"Course");
