import MoodLog from "../../models/moodLog/moodLogModel.js";
import createCrudController from "../utils/createCrudController.js";

const moodLogController=createCrudController({
 Model:MoodLog,
 dataKey:"moodLogs",
 defaultSort:{logDate:-1}
});

export default moodLogController;