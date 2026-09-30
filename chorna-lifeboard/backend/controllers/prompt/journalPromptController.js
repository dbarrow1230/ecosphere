import JournalPrompt from "../../models/prompt/journalPromptModel.js";
import createCrudController from "../utils/createCrudController.js";

const journalPromptController=createCrudController({
 Model:JournalPrompt,
 dataKey:"journalPrompts",
 defaultSort:{sortOrder:1,createdAt:1}
});

export default journalPromptController;