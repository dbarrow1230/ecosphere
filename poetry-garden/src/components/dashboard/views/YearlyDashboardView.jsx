// src/components/dashboard/YearlyDashboardView.jsx
import {Image,Flag,Clock3,BookOpen,NotebookText,Brain} from "lucide-react";
import DailyDashboardView from "./DailyDashboardView.jsx";
import DashboardSection from "../DashboardSection.jsx";
import DashboardList from "../DashboardList.jsx";
import {getItemDate,getItemDateRaw,getStatus,getGroupName} from "./DashboardViewHelpers.js";

function YearlyDashboardView(props){

 const {data,showTimelinePreview=true}=props;

 const recentItems=[
  ...data.journalEntries.map(item=>({...item,itemSource:"Writing Journal",itemIcon:"journal"})),
  ...data.notes.map(item=>({...item,itemSource:"Writing Note",itemIcon:"note"})),
  ...data.memories.map(item=>({...item,itemSource:"Writing Record",itemIcon:"memory"})),
  ...data.timelineEntries.map(item=>({...item,itemSource:"Writing Timeline",itemIcon:"timeline"}))
 ].sort((a,b)=>new Date(getItemDateRaw(b)||b.createdAt||0)-new Date(getItemDateRaw(a)||a.createdAt||0)).slice(0,8);

 return(
  <>
   <DailyDashboardView
    {...props}
    viewKicker="Yearly Poetry Focus"
    taskEmptyText="No shop tasks for this year."
    priorityEmptyText="No priority poems or writing issues need attention this year."
    goalEmptyText="No writing goals due this year."
    journalEmptyText="No writing journal entries for this year."
    mindfulnessEmptyText="No shop check-ins for this year."
    moodEmptyText="No writing mood logs for this year."
    noteEmptyText="No shop notes for this year."
    calendarEmptyText="No shop events for this year."
    reminderEmptyText="No shop reminders for this year."
    milestoneEmptyText="No shop milestones for this year."
    reviewEmptyText="No shop reviews for this year."
   />

   {showTimelinePreview&&(
    <DashboardSection kicker="Writing Record" title="Yearly Timeline, Notes, and Journal Logs" linkTo="/timeline" linkText="Open timeline" wide>
     <ul className="dashboard-list dashboard-list-two-column">
      {recentItems?.length?recentItems.map(item=>(
       <li key={`${item.itemSource}-${item._id||item.id||item.name||item.title}`} className="dashboard-list-item">
        <span className="dashboard-list-icon dashboard-list-icon-warning">
         {item.itemIcon==="journal"?<BookOpen size={17} strokeWidth={2.2}/>:item.itemIcon==="note"?<NotebookText size={17} strokeWidth={2.2}/>:item.itemIcon==="memory"?<Brain size={17} strokeWidth={2.2}/>:<Clock3 size={17} strokeWidth={2.2}/>}
        </span>

        <div className="dashboard-list-content">
         <span className="dashboard-item-title">{item.title||item.name||"Untitled Poetry Item"}</span>
         <span className="dashboard-item-meta">{item.itemSource} · {getStatus(item)} · {getItemDate(item)||"Recent"}</span>
        </div>
       </li>
      )):(
       <li className="dashboard-empty dashboard-empty-wide">No yearly writing timeline, journal, note, or record items yet.</li>
      )}
     </ul>
    </DashboardSection>
   )}

   <DashboardSection kicker="Writing Vision" title="Writing Boards" linkTo="/vision-boards">
    <DashboardList items={data.visionBoards} emptyText="No active shop boards for this year." icon={<Image size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.boardType||"shop"} · ${item.isPrivate?"Private":"Visible"} · ${getGroupName(item)}`}/>
   </DashboardSection>

   <DashboardSection kicker="Writing Themes" title="Poetry Themes" linkTo="/life-themes">
    <DashboardList items={data.lifeThemes} emptyText="No active shop themes for this year." icon={<Flag size={17} strokeWidth={2.2}/>} getStatus={getStatus} getGroupName={getGroupName} metaBuilder={item=>`${item.themeType||"shop theme"} · ${item.status||"active"} · ${item.startDateDisplay||"No start date"}`}/>
   </DashboardSection>
  </>
 );
}

export default YearlyDashboardView;
