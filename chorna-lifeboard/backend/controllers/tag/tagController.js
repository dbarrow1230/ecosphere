// backend/controllers/tag/tagController.js
import Tag from "../../models/tag/tagModel.js";
import createCrudController from "../utils/createCrudController.js";

const tagController=createCrudController({
 Model:Tag,
 dataKey:"tags",
 defaultSort:{name:1}
});

export default tagController;