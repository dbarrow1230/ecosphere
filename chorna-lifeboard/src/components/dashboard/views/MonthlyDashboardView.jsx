// src/components/dashboard/MonthlyDashboardView.jsx
import DailyDashboardView from "./DailyDashboardView.jsx";

function MonthlyDashboardView(props){
 return(
  <DailyDashboardView
   {...props}
   viewKicker="Monthly Focus"
   taskEmptyText="No tasks for this month."
   priorityEmptyText="No priorities need attention this month."
   goalEmptyText="No goals due this month."
   journalEmptyText="No journal entries for this month."
   mindfulnessEmptyText="No mindfulness check-ins for this month."
   moodEmptyText="No mood logs for this month."
   noteEmptyText="No notes for this month."
   calendarEmptyText="No calendar events for this month."
   reminderEmptyText="No reminders for this month."
   milestoneEmptyText="No milestones for this month."
   reviewEmptyText="No reviews for this month."
  />
 );
}

export default MonthlyDashboardView;