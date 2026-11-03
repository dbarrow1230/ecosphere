import JournalEntry from "../../models/journalEntry/journalEntryModel.js";
import createCrudController from "../utils/createCrudController.js";

const journalEntryController=createCrudController({
 Model:JournalEntry,
 dataKey:"journalEntries",
 defaultSort:{entryDate:-1}
});

export default journalEntryController;