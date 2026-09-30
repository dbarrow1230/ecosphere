// src/components/dashboard/MonthlyDashboardView.jsx
import DailyDashboardView from "./DailyDashboardView.jsx";

function MonthlyDashboardView(props){
 return(
  <DailyDashboardView
   {...props}
   viewKicker="Monthly Poetry Focus"
   taskEmptyText="No shop tasks for this month."
   priorityEmptyText="No priority poems or writing issues need attention this month."
   goalEmptyText="No writing goals due this month."
   journalEmptyText="No writing journal entries for this month."
   mindfulnessEmptyText="No shop check-ins for this month."
   moodEmptyText="No writing mood logs for this month."
   noteEmptyText="No shop notes for this month."
   calendarEmptyText="No shop events for this month."
   reminderEmptyText="No shop reminders for this month."
   milestoneEmptyText="No shop milestones for this month."
   reviewEmptyText="No shop reviews for this month."
  />
 );
}

export default MonthlyDashboardView;
