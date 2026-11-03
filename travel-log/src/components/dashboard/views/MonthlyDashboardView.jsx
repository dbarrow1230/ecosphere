// src/components/dashboard/MonthlyDashboardView.jsx
import DailyDashboardView from "./DailyDashboardView.jsx";

function MonthlyDashboardView(props){
 return(
  <DailyDashboardView
   {...props}
   viewKicker="Monthly Travel Focus"
   taskEmptyText="No travel tasks for this month."
   priorityEmptyText="No priority trips or travel issues need attention this month."
   goalEmptyText="No travel goals due this month."
   journalEmptyText="No travel logs for this month."
   mindfulnessEmptyText="No travel check-ins for this month."
   moodEmptyText="No travel mood logs for this month."
   noteEmptyText="No travel notes for this month."
   calendarEmptyText="No travel events for this month."
   reminderEmptyText="No travel reminders for this month."
   milestoneEmptyText="No travel milestones for this month."
   reviewEmptyText="No travel reviews for this month."
  />
 );
}

export default MonthlyDashboardView;