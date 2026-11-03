import Prompt from "../../models/prompt/promptModel.js";
import createCrudController from "../utils/createCrudController.js";

const promptController=createCrudController({
 Model:Prompt,
 dataKey:"prompts",
 defaultSort:{sortOrder:1,createdAt:1}
});

export default promptController;