import MindfulnessEntry from "../../models/mindfulness/mindfulnessEntryModel.js";
import createCrudController from "../utils/createCrudController.js";

const mindfulnessController=createCrudController({
 Model:MindfulnessEntry,
 dataKey:"mindfulnessEntries",
 defaultSort:{entryDate:-1}
});

export default mindfulnessController;