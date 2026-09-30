// src/components/dashboard/WeeklyDashboardView.jsx
import DailyDashboardView from "./DailyDashboardView.jsx";

function WeeklyDashboardView(props){
 return(
  <DailyDashboardView
   {...props}
   viewKicker="Weekly Travel Focus"
   taskEmptyText="No travel tasks for this week."
   priorityEmptyText="No priority trips or travel issues need attention this week."
   goalEmptyText="No travel goals due this week."
   journalEmptyText="No travel logs for this week."
   mindfulnessEmptyText="No travel check-ins for this week."
   moodEmptyText="No travel mood logs for this week."
   noteEmptyText="No travel notes for this week."
   calendarEmptyText="No travel events for this week."
   reminderEmptyText="No travel reminders for this week."
   milestoneEmptyText="No travel milestones for this week."
   reviewEmptyText="No travel reviews for this week."
  />
 );
}

export default WeeklyDashboardView;