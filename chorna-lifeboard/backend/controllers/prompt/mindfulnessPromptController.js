import MindfulnessPrompt from "../../models/prompt/mindufilnessPromptsModel.js";
import createCrudController from "../utils/createCrudController.js";

const mindfulnessPromptController=createCrudController({
 Model:MindfulnessPrompt,
 dataKey:"mindfulnessPrompts",
 defaultSort:{sortOrder:1,createdAt:1}
});

export default mindfulnessPromptController;