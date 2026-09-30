// src/components/dashboard/views/DailyDashboardView.jsx
import {Target,TriangleAlert,ListChecks,BookOpen,CalendarCheck,HeartPulse,NotebookText,Smile,CalendarDays,Bell,Repeat,Trophy,Star} from "lucide-react";
import DashboardSection from "../DashboardSection.jsx";
import DashboardList from "../DashboardList.jsx";
import DashboardProgress from "../DashboardProgress.jsx";
import {getGroupName,getItemDate,getItemDateRaw,getStatus} from "./DashboardViewHelpers.js";

function DailyDashboardView({
 data,
 categoryProgress=[],
 showMoodSummary=true,
 showHabitProgress=true,
 showUpcomingReminders=true,
 viewKicker="Today",
 taskEmptyText="No tasks for today.",
 priorityEmptyText="No priorities need attention right now.",
 goalEmptyText="No goals due today.",
 journalEmptyText="No journal entries for today.",
 mindfulnessEmptyText="No mindfulness check-ins for today.",
 moodEmptyText="No mood logs for today.",
 noteEmptyText="No notes for today.",
 calendarEmptyText="No calendar events for today.",
 reminderEmptyText="No reminders for today.",
 milestoneEmptyText="No milestones for today.",
 reviewEmptyText="No reviews for today."
}){

 return(
  <>
   {showHabitProgress&&(
    <DashboardProgress
     categoryProgress={categoryProgress}
     activeGoals={data.activeGoals}
     activeHabits={data.activeHabits}
     habitLogs={data.habitLogs}
     getGroupName={getGroupName}
     getItemDateRaw={getItemDateRaw}
    />
   )}

   <DashboardSection kicker={viewKicker} title="Priorities" linkTo="/priorities" priority>
    <DashboardList items={data.priorities} emptyText={priorityEmptyText} icon={<TriangleAlert size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.priorityLevel||item.priority||"medium"} · ${getStatus(item)} · ${getGroupName(item)}`}/>
   </DashboardSection>

   <DashboardSection kicker="Action Items" title="Tasks" linkTo="/tasks">
    <DashboardList items={data.pendingTasks.length?data.pendingTasks:data.tasks} emptyText={taskEmptyText} icon={<ListChecks size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.taskType||"task"} · ${item.status||"pending"} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Goals" title="Due Goals" linkTo="/goals">
    <DashboardList items={data.dueGoals.length?data.dueGoals:data.activeGoals.slice(0,6)} emptyText={goalEmptyText} icon={<Target size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.progress??0}% · ${item.status||"active"} · ${getItemDate(item)||"No target date"}`}/>
   </DashboardSection>

   {showHabitProgress&&(
    <>
     <DashboardSection kicker="Habit Tracking" title="Habits" linkTo="/habits">
      <DashboardList items={data.activeHabits} emptyText="No active habits yet." icon={<CalendarCheck size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.frequency||"daily"} · ${item.status||"active"} · ${getGroupName(item)}`}/>
     </DashboardSection>

     <DashboardSection kicker="Routine Tracking" title="Routines" linkTo="/routines">
      <DashboardList items={data.activeRoutines} emptyText="No active routines yet." icon={<Repeat size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.routineType||"routine"} · ${item.frequency||"daily"} · ${getGroupName(item)}`}/>
     </DashboardSection>
    </>
   )}

   <DashboardSection kicker="Journal" title="Journal Entries" linkTo="/journal" linkText="Open journal">
    <DashboardList items={data.journalEntries} emptyText={journalEmptyText} icon={<BookOpen size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.journalType||"daily"} · ${item.mood||"No mood"} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Mindfulness" title="Check-ins" linkTo="/mindfulness">
    <DashboardList items={data.mindfulnessEntries} emptyText={mindfulnessEmptyText} icon={<HeartPulse size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.mood||"No mood"} · Energy ${item.energy||"-"} · Stress ${item.stress||"-"}`}/>
   </DashboardSection>

   {showMoodSummary&&(
    <DashboardSection kicker="Mood" title="Mood Logs" linkTo="/mood-log">
     <DashboardList items={data.moodLogs} emptyText={moodEmptyText} icon={<Smile size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.mood||"No mood"} · Energy ${item.energy||"-"} · ${getItemDate(item)||"No date"}`}/>
    </DashboardSection>
   )}

   <DashboardSection kicker="Notes" title="Recent Notes" linkTo="/notes">
    <DashboardList items={data.notes} emptyText={noteEmptyText} icon={<NotebookText size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.noteType||"general"} · ${getGroupName(item)} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Calendar" title="Events" linkTo="/calendar" linkText="Open calendar">
    <DashboardList items={data.calendarEvents} emptyText={calendarEmptyText} icon={<CalendarDays size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.eventType||"event"} · ${item.status||"scheduled"} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   {showUpcomingReminders&&(
    <DashboardSection kicker="Reminders" title="Upcoming Reminders" linkTo="/reminders">
     <DashboardList items={data.reminders} emptyText={reminderEmptyText} icon={<Bell size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.reminderType||"custom"} · ${item.status||"pending"} · ${item.sendAtDisplay||getItemDate(item)||"No send date"}`}/>
    </DashboardSection>
   )}

   <DashboardSection kicker="Milestones" title="Milestones" linkTo="/milestones">
    <DashboardList items={data.milestones} emptyText={milestoneEmptyText} icon={<Trophy size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.milestoneType||"personal"} · ${getGroupName(item)} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Reviews" title="Reviews" linkTo="/reviews">
    <DashboardList items={data.reviews} emptyText={reviewEmptyText} icon={<Star size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.reviewType||"review"} · ${item.periodStartDisplay||"Start"} - ${item.periodEndDisplay||"End"}`}/>
   </DashboardSection>
  </>
 );
}

export default DailyDashboardView;