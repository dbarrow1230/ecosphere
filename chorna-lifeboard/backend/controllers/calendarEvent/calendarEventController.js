import CalendarEvent from "../../models/calendarEvent/calendarEventModel.js";
import createCrudController from "../utils/createCrudController.js";

const calendarEventController=createCrudController({
 Model:CalendarEvent,
 dataKey:"calendarEvents",
 defaultSort:{startDate:1}
});

export default calendarEventController;