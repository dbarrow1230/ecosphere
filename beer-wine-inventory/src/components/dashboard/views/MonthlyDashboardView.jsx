// src/components/dashboard/MonthlyDashboardView.jsx
import DailyDashboardView from "./DailyDashboardView.jsx";

function MonthlyDashboardView(props){
 return(
  <DailyDashboardView
   {...props}
   viewKicker="Monthly Shop Focus"
   taskEmptyText="No shop tasks for this month."
   priorityEmptyText="No priority orders or shop issues need attention this month."
   goalEmptyText="No production goals due this month."
   journalEmptyText="No production logs for this month."
   mindfulnessEmptyText="No shop check-ins for this month."
   moodEmptyText="No customer or staff mood logs for this month."
   noteEmptyText="No shop notes for this month."
   calendarEmptyText="No shop events for this month."
   reminderEmptyText="No shop reminders for this month."
   milestoneEmptyText="No shop milestones for this month."
   reviewEmptyText="No shop reviews for this month."
  />
 );
}

export default MonthlyDashboardView;