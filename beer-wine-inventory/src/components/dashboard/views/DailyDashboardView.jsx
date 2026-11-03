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
 taskEmptyText="No shop tasks for today.",
 priorityEmptyText="No priority orders or shop issues need attention right now.",
 goalEmptyText="No production goals due today.",
 journalEmptyText="No production logs for today.",
 mindfulnessEmptyText="No shop check-ins for today.",
 moodEmptyText="No customer or staff mood logs for today.",
 noteEmptyText="No shop notes for today.",
 calendarEmptyText="No shop events for today.",
 reminderEmptyText="No shop reminders for today.",
 milestoneEmptyText="No shop milestones for today.",
 reviewEmptyText="No shop reviews for today."
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

   <DashboardSection kicker={viewKicker} title="Priority Orders & Issues" linkTo="/priorities" priority>
    <DashboardList items={data.priorities} emptyText={priorityEmptyText} icon={<TriangleAlert size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.priorityLevel||item.priority||"medium"} · ${getStatus(item)} · ${getGroupName(item)}`}/>
   </DashboardSection>

   <DashboardSection kicker="Shop Action Items" title="Tasks" linkTo="/tasks">
    <DashboardList items={data.pendingTasks.length?data.pendingTasks:data.tasks} emptyText={taskEmptyText} icon={<ListChecks size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.taskType||"shop task"} · ${item.status||"pending"} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Production Goals" title="Due Production Goals" linkTo="/goals">
    <DashboardList items={data.dueGoals.length?data.dueGoals:data.activeGoals.slice(0,6)} emptyText={goalEmptyText} icon={<Target size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.progress??0}% · ${item.status||"active"} · ${getItemDate(item)||"No target date"}`}/>
   </DashboardSection>

   {showHabitProgress&&(
    <>
     <DashboardSection kicker="Daily Operations" title="Operational Habits" linkTo="/habits">
      <DashboardList items={data.activeHabits} emptyText="No active shop habits yet." icon={<CalendarCheck size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.frequency||"daily"} · ${item.status||"active"} · ${getGroupName(item)}`}/>
     </DashboardSection>

     <DashboardSection kicker="Shop Routines" title="Production & Prep Routines" linkTo="/routines">
      <DashboardList items={data.activeRoutines} emptyText="No active shop routines yet." icon={<Repeat size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.routineType||"shop routine"} · ${item.frequency||"daily"} · ${getGroupName(item)}`}/>
     </DashboardSection>
    </>
   )}

   <DashboardSection kicker="Production Logs" title="Production Entries" linkTo="/journal" linkText="Open logs">
    <DashboardList items={data.journalEntries} emptyText={journalEmptyText} icon={<BookOpen size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.journalType||"production"} · ${item.mood||"No note"} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Shop Check-ins" title="Daily Check-ins" linkTo="/mindfulness">
    <DashboardList items={data.mindfulnessEntries} emptyText={mindfulnessEmptyText} icon={<HeartPulse size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.mood||"No status"} · Energy ${item.energy||"-"} · Stress ${item.stress||"-"}`}/>
   </DashboardSection>

   {showMoodSummary&&(
    <DashboardSection kicker="Customer & Staff Mood" title="Mood Logs" linkTo="/mood-log">
     <DashboardList items={data.moodLogs} emptyText={moodEmptyText} icon={<Smile size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.mood||"No mood"} · Energy ${item.energy||"-"} · ${getItemDate(item)||"No date"}`}/>
    </DashboardSection>
   )}

   <DashboardSection kicker="Shop Notes" title="Recent Notes" linkTo="/notes">
    <DashboardList items={data.notes} emptyText={noteEmptyText} icon={<NotebookText size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.noteType||"shop note"} · ${getGroupName(item)} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Production Calendar" title="Shop Events" linkTo="/calendar" linkText="Open calendar">
    <DashboardList items={data.calendarEvents} emptyText={calendarEmptyText} icon={<CalendarDays size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.eventType||"shop event"} · ${item.status||"scheduled"} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   {showUpcomingReminders&&(
    <DashboardSection kicker="Shop Reminders" title="Upcoming Reminders" linkTo="/reminders">
     <DashboardList items={data.reminders} emptyText={reminderEmptyText} icon={<Bell size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.reminderType||"custom"} · ${item.status||"pending"} · ${item.sendAtDisplay||getItemDate(item)||"No send date"}`}/>
    </DashboardSection>
   )}

   <DashboardSection kicker="Shop Milestones" title="Milestones" linkTo="/milestones">
    <DashboardList items={data.milestones} emptyText={milestoneEmptyText} icon={<Trophy size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.milestoneType||"shop"} · ${getGroupName(item)} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Shop Reviews" title="Reviews" linkTo="/reviews">
    <DashboardList items={data.reviews} emptyText={reviewEmptyText} icon={<Star size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.reviewType||"shop review"} · ${item.periodStartDisplay||"Start"} - ${item.periodEndDisplay||"End"}`}/>
   </DashboardSection>
  </>
 );
}

export default DailyDashboardView;