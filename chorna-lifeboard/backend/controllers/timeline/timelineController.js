import TimelineEntry from "../../models/timeline/timelineEntryModel.js";
import createCrudController from "../utils/createCrudController.js";

const timelineController=createCrudController({
 Model:TimelineEntry,
 dataKey:"timelineEntries",
 defaultSort:{entryDate:-1}
});

export default timelineController;