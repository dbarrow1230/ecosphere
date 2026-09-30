// src/components/dashboard/WeeklyDashboardView.jsx
import DailyDashboardView from "./DailyDashboardView.jsx";

function WeeklyDashboardView(props){
 return(
  <DailyDashboardView
   {...props}
   viewKicker="Weekly Shop Focus"
   taskEmptyText="No shop tasks for this week."
   priorityEmptyText="No priority orders or shop issues need attention this week."
   goalEmptyText="No production goals due this week."
   journalEmptyText="No production logs for this week."
   mindfulnessEmptyText="No shop check-ins for this week."
   moodEmptyText="No customer or staff mood logs for this week."
   noteEmptyText="No shop notes for this week."
   calendarEmptyText="No shop events for this week."
   reminderEmptyText="No shop reminders for this week."
   milestoneEmptyText="No shop milestones for this week."
   reviewEmptyText="No shop reviews for this week."
  />
 );
}

export default WeeklyDashboardView;