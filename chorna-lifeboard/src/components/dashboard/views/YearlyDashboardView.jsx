// src/components/dashboard/YearlyDashboardView.jsx
import {Image,Flag,Clock3,BookOpen,NotebookText,Brain} from "lucide-react";
import DailyDashboardView from "./DailyDashboardView.jsx";
import DashboardSection from "../DashboardSection.jsx";
import DashboardList from "../DashboardList.jsx";
import {getItemDate,getItemDateRaw,getStatus,getGroupName} from "./DashboardViewHelpers.js";

function YearlyDashboardView(props){

 const {data,showTimelinePreview=true}=props;

 const recentItems=[
  ...data.journalEntries.map(item=>({...item,itemSource:"Journal",itemIcon:"journal"})),
  ...data.notes.map(item=>({...item,itemSource:"Note",itemIcon:"note"})),
  ...data.memories.map(item=>({...item,itemSource:"Memory",itemIcon:"memory"})),
  ...data.timelineEntries.map(item=>({...item,itemSource:"Timeline",itemIcon:"timeline"}))
 ].sort((a,b)=>new Date(getItemDateRaw(b)||b.createdAt||0)-new Date(getItemDateRaw(a)||a.createdAt||0)).slice(0,8);

 return(
  <>
   <DailyDashboardView
    {...props}
    viewKicker="Yearly Focus"
    taskEmptyText="No tasks for this year."
    priorityEmptyText="No priorities need attention this year."
    goalEmptyText="No goals due this year."
    journalEmptyText="No journal entries for this year."
    mindfulnessEmptyText="No mindfulness check-ins for this year."
    moodEmptyText="No mood logs for this year."
    noteEmptyText="No notes for this year."
    calendarEmptyText="No calendar events for this year."
    reminderEmptyText="No reminders for this year."
    milestoneEmptyText="No milestones for this year."
    reviewEmptyText="No reviews for this year."
   />

   {showTimelinePreview&&(
    <DashboardSection kicker="Chronological Record" title="Yearly Timeline, Notes, Memories" linkTo="/timeline" linkText="Open timeline" wide>
     <ul className="dashboard-list dashboard-list-two-column">
      {recentItems?.length?recentItems.map(item=>(
       <li key={`${item.itemSource}-${item._id||item.id||item.name||item.title}`} className="dashboard-list-item">
        <span className="dashboard-list-icon dashboard-list-icon-warning">
         {item.itemIcon==="journal"?<BookOpen size={17} strokeWidth={2.2}/>:item.itemIcon==="note"?<NotebookText size={17} strokeWidth={2.2}/>:item.itemIcon==="memory"?<Brain size={17} strokeWidth={2.2}/>:<Clock3 size={17} strokeWidth={2.2}/>}
        </span>

        <div className="dashboard-list-content">
         <span className="dashboard-item-title">{item.title||item.name||"Untitled"}</span>
         <span className="dashboard-item-meta">{item.itemSource} · {getStatus(item)} · {getItemDate(item)||"Recent"}</span>
        </div>
       </li>
      )):(
       <li className="dashboard-empty dashboard-empty-wide">No yearly timeline, journal, note, or memory items yet.</li>
      )}
     </ul>
    </DashboardSection>
   )}

   <DashboardSection kicker="Vision" title="Vision Boards" linkTo="/vision-boards">
    <DashboardList items={data.visionBoards} emptyText="No active vision boards for this year." icon={<Image size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.boardType||"personal"} · ${item.isPrivate?"Private":"Visible"} · ${getGroupName(item)}`}/>
   </DashboardSection>

   <DashboardSection kicker="Themes" title="Life Themes" linkTo="/life-themes">
    <DashboardList items={data.lifeThemes} emptyText="No active life themes for this year." icon={<Flag size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.themeType||"theme"} · ${item.status||"active"} · ${item.startDateDisplay||"No start date"}`}/>
   </DashboardSection>
  </>
 );
}

export default YearlyDashboardView;