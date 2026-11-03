import Reminder from "../../models/reminders/reminderModel.js";
import createCrudController from "../utils/createCrudController.js";

const reminderController=createCrudController({
 Model:Reminder,
 dataKey:"reminders",
 defaultSort:{sendAt:1}
});

export default reminderController;