// src/components/dashboard/WeeklyDashboardView.jsx
import DailyDashboardView from "./DailyDashboardView.jsx";

function WeeklyDashboardView(props){
 return(
  <DailyDashboardView
   {...props}
   viewKicker="Weekly Focus"
   taskEmptyText="No tasks for this week."
   priorityEmptyText="No priorities need attention this week."
   goalEmptyText="No goals due this week."
   journalEmptyText="No journal entries for this week."
   mindfulnessEmptyText="No mindfulness check-ins for this week."
   moodEmptyText="No mood logs for this week."
   noteEmptyText="No notes for this week."
   calendarEmptyText="No calendar events for this week."
   reminderEmptyText="No reminders for this week."
   milestoneEmptyText="No milestones for this week."
   reviewEmptyText="No reviews for this week."
  />
 );
}

export default WeeklyDashboardView;