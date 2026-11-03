import Category from "../../models/category/categoryModel.js";
import createCrudController from "../utils/createCrudController.js";

const categoryController=createCrudController({
 Model:Category,
 dataKey:"categories",
 defaultSort:{name:1}
});

export default categoryController;