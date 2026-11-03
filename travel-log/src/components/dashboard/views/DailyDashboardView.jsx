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
 taskEmptyText="No travel tasks for today.",
 priorityEmptyText="No priority trips or travel issues need attention right now.",
 goalEmptyText="No travel goals due today.",
 journalEmptyText="No travel logs for today.",
 mindfulnessEmptyText="No travel check-ins for today.",
 moodEmptyText="No travel mood logs for today.",
 noteEmptyText="No travel notes for today.",
 calendarEmptyText="No travel events for today.",
 reminderEmptyText="No travel reminders for today.",
 milestoneEmptyText="No travel milestones for today.",
 reviewEmptyText="No travel reviews for today."
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

   <DashboardSection kicker={viewKicker} title="Priority Trips & Issues" linkTo="/priorities" priority>
    <DashboardList items={data.priorities} emptyText={priorityEmptyText} icon={<TriangleAlert size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.priorityLevel||item.priority||"medium"} · ${getStatus(item)} · ${getGroupName(item)}`}/>
   </DashboardSection>

   <DashboardSection kicker="Travel Action Items" title="Tasks" linkTo="/tasks">
    <DashboardList items={data.pendingTasks.length?data.pendingTasks:data.tasks} emptyText={taskEmptyText} icon={<ListChecks size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.taskType||"travel task"} · ${item.status||"pending"} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Travel Goals" title="Due Travel Goals" linkTo="/goals">
    <DashboardList items={data.dueGoals.length?data.dueGoals:data.activeGoals.slice(0,6)} emptyText={goalEmptyText} icon={<Target size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.progress??0}% · ${item.status||"active"} · ${getItemDate(item)||"No target date"}`}/>
   </DashboardSection>

   {showHabitProgress&&(
    <>
     <DashboardSection kicker="Travel Routines" title="Travel Habits" linkTo="/habits">
      <DashboardList items={data.activeHabits} emptyText="No active travel habits yet." icon={<CalendarCheck size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.frequency||"daily"} · ${item.status||"active"} · ${getGroupName(item)}`}/>
     </DashboardSection>

     <DashboardSection kicker="Trip Routines" title="Planning & Travel Routines" linkTo="/routines">
      <DashboardList items={data.activeRoutines} emptyText="No active travel routines yet." icon={<Repeat size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.routineType||"travel routine"} · ${item.frequency||"daily"} · ${getGroupName(item)}`}/>
     </DashboardSection>
    </>
   )}

   <DashboardSection kicker="Travel Logs" title="Travel Entries" linkTo="/journal" linkText="Open logs">
    <DashboardList items={data.journalEntries} emptyText={journalEmptyText} icon={<BookOpen size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.journalType||"travel"} · ${item.mood||"No note"} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Travel Check-ins" title="Daily Check-ins" linkTo="/mindfulness">
    <DashboardList items={data.mindfulnessEntries} emptyText={mindfulnessEmptyText} icon={<HeartPulse size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.mood||"No status"} · Energy ${item.energy||"-"} · Stress ${item.stress||"-"}`}/>
   </DashboardSection>

   {showMoodSummary&&(
    <DashboardSection kicker="Travel Mood" title="Mood Logs" linkTo="/mood-log">
     <DashboardList items={data.moodLogs} emptyText={moodEmptyText} icon={<Smile size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.mood||"No mood"} · Energy ${item.energy||"-"} · ${getItemDate(item)||"No date"}`}/>
    </DashboardSection>
   )}

   <DashboardSection kicker="Travel Notes" title="Recent Notes" linkTo="/notes">
    <DashboardList items={data.notes} emptyText={noteEmptyText} icon={<NotebookText size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.noteType||"travel note"} · ${getGroupName(item)} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Travel Calendar" title="Travel Events" linkTo="/calendar" linkText="Open calendar">
    <DashboardList items={data.calendarEvents} emptyText={calendarEmptyText} icon={<CalendarDays size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.eventType||"travel event"} · ${item.status||"scheduled"} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   {showUpcomingReminders&&(
    <DashboardSection kicker="Travel Reminders" title="Upcoming Reminders" linkTo="/reminders">
     <DashboardList items={data.reminders} emptyText={reminderEmptyText} icon={<Bell size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.reminderType||"custom"} · ${item.status||"pending"} · ${item.sendAtDisplay||getItemDate(item)||"No send date"}`}/>
    </DashboardSection>
   )}

   <DashboardSection kicker="Travel Milestones" title="Milestones" linkTo="/milestones">
    <DashboardList items={data.milestones} emptyText={milestoneEmptyText} icon={<Trophy size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.milestoneType||"travel"} · ${getGroupName(item)} · ${getItemDate(item)||"No date"}`}/>
   </DashboardSection>

   <DashboardSection kicker="Travel Reviews" title="Reviews" linkTo="/reviews">
    <DashboardList items={data.reviews} emptyText={reviewEmptyText} icon={<Star size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.reviewType||"travel review"} · ${item.periodStartDisplay||"Start"} - ${item.periodEndDisplay||"End"}`}/>
   </DashboardSection>
  </>
 );
}

export default DailyDashboardView;