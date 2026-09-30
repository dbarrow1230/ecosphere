import ResourcePage from "../../components/photography/ResourcePage.jsx";
import ReminderForm from "../forms/photography/ReminderForm.jsx";
import {reminderFields} from "../../config/photographyFields.js";
const lookups={"shootRef":"/api/shoots"};
export default function RemindersPage(){return <ResourcePage title="Reminders" singular="Reminder" endpoint="/api/photo-reminders" FormComponent={ReminderForm} fields={reminderFields} lookups={lookups} description="Track due dates here and on your dashboard. These are in-app reminders; email and background notifications are not enabled."/>;}
