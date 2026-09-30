// src/components/dashboard/WeeklyDashboardView.jsx
import DailyDashboardView from "./DailyDashboardView.jsx";

function WeeklyDashboardView(props){
 return(
  <DailyDashboardView
   {...props}
   viewKicker="Weekly Poetry Focus"
   taskEmptyText="No shop tasks for this week."
   priorityEmptyText="No priority poems or writing issues need attention this week."
   goalEmptyText="No writing goals due this week."
   journalEmptyText="No writing journal entries for this week."
   mindfulnessEmptyText="No shop check-ins for this week."
   moodEmptyText="No writing mood logs for this week."
   noteEmptyText="No shop notes for this week."
   calendarEmptyText="No shop events for this week."
   reminderEmptyText="No shop reminders for this week."
   milestoneEmptyText="No shop milestones for this week."
   reviewEmptyText="No shop reviews for this week."
  />
 );
}

export default WeeklyDashboardView;
