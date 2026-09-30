import {BookOpen,CalendarDays,CheckCircle2,ClipboardList,Layers,Map,PenLine,Search,Users} from "lucide-react";
import {Link} from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import DashboardList from "../components/dashboard/DashboardList.jsx";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions.jsx";
import DashboardSection from "../components/dashboard/DashboardSection.jsx";
import "../styles/Dashboard.css";

const plannerWorkflow=[
 {
  id:"project-overview",
  route:"/planner/project-overview",
  kicker:"Project Setup",
  title:"Project Overview & Development",
  icon:<BookOpen size={17} strokeWidth={2.2}/>,
  items:[
   {title:"Name Your Story",meta:"Title options, book basics, and ownership setup."},
   {title:"Genre, Audience, Theme",meta:"Genre, subgenre, target reader, themes, motifs, tone, and style."},
   {title:"Pitch & Timeline",meta:"Elevator pitch, future planning, story dashboard, writing style, and story timeline."}
  ]
 },
 {
  id:"characters",
  route:"/planner/characters",
  kicker:"Cast",
  title:"Character Development",
  icon:<Users size={17} strokeWidth={2.2}/>,
  items:[
   {title:"Character List",meta:"Cast list for every character in the story."},
   {title:"Profiles & Arcs",meta:"Character profiles, story roles, development arcs, and visual references."},
   {title:"Protagonist, Antagonist, Relationships",meta:"Main forces, relationships, connections, and story overview pages."}
  ]
 },
 {
  id:"world-building",
  route:"/planner/world-building",
  kicker:"Setting",
  title:"World-Building & Setting",
  icon:<Map size={17} strokeWidth={2.2}/>,
  items:[
   {title:"Setting Exploration",meta:"Primary setting, descriptions, time period, atmosphere, and mood."},
   {title:"Locations & Landmarks",meta:"Key locations, landmarks, and setting interaction."},
   {title:"Culture & Infrastructure",meta:"Historical background, social context, technology, and cultural elements."}
  ]
 },
 {
  id:"plot-structure",
  route:"/planner/plot-structure",
  kicker:"Structure",
  title:"Plot Structure & Story Planning",
  icon:<Layers size={17} strokeWidth={2.2}/>,
  items:[
   {title:"Story Arc",meta:"Introduction, inciting incident, key plot points, rising action, climax, and resolution."},
   {title:"Subplots & Conflict",meta:"Subplot overview, foreshadowing, conflict resolution, and lessons learned."},
   {title:"Act Planning",meta:"Act structure and writing prep for Act 1, Act 2, and Act 3."}
  ]
 },
 {
  id:"chapters-scenes",
  route:"/planner/chapters-scenes",
  kicker:"Draft Build",
  title:"Chapters & Scenes",
  icon:<ClipboardList size={17} strokeWidth={2.2}/>,
  items:[
   {title:"Chapter List",meta:"Chapter order and manuscript organization."},
   {title:"Chapter Dashboard",meta:"Chapter status, purpose, summary, and drafting progress."},
   {title:"Scene Dashboard",meta:"Scene-level planning for purpose, action, characters, and notes."}
  ]
 },
 {
  id:"writing-progress",
  route:"/planner/writing-progress",
  kicker:"Productivity",
  title:"Writing Progress & Productivity",
  icon:<CalendarDays size={17} strokeWidth={2.2}/>,
  items:[
   {title:"Writing Goals & Roadmap",meta:"Milestones, goals, writing style, and project roadmap."},
   {title:"Trackers",meta:"Word count tracker, writing tracker, chapter progress, and project tracker."},
   {title:"Planning Pages",meta:"Daily, weekly, monthly planner pages, to-do list, and Pomodoro tracker."}
  ]
 },
 {
  id:"research-inspiration",
  route:"/planner/research-inspiration",
  kicker:"Reference",
  title:"Research & Inspiration",
  icon:<Search size={17} strokeWidth={2.2}/>,
  items:[
   {title:"Research Tracker",meta:"Research log, notes, documented sources, and questions."},
   {title:"Books & References",meta:"Books, references, source notes, and materials to review."},
   {title:"Inspiration",meta:"Influences, inspiration gallery, quote pages, and inspiration notes."}
  ]
 },
 {
  id:"revision-editing",
  route:"/planner/revision-editing",
  kicker:"Editing",
  title:"Revision & Editing",
  icon:<CheckCircle2 size={17} strokeWidth={2.2}/>,
  items:[
   {title:"Revision Notes",meta:"Manuscript changes and revision notes."},
   {title:"Revision Checklist",meta:"Scene, chapter, continuity, pacing, character, and polish checks."},
   {title:"Authorial Checklist",meta:"Final author review pages before the book moves forward."}
  ]
 },
 {
  id:"notes-extras",
  route:"/planner/notes-extras",
  kicker:"Extras",
  title:"Notes, Brainstorm & Publishing",
  icon:<PenLine size={17} strokeWidth={2.2}/>,
  items:[
   {title:"Brainstorming & Feedback",meta:"Idea capture, feedback log, mind map, and quote collection."},
   {title:"Publishing & Marketing",meta:"Publishing plan and marketing ideas."},
   {title:"Backup & Notes",meta:"Backup log plus lined, blank, and grid note pages."}
  ]
 }
];

function NovelPlannerDashboard(){
 return(
  <section className="dashboard">
   <DashboardHeader
    kicker="Main Dashboard"
    title="Novel Planner"
    text="The main dashboard keeps the planner pipeline visible without replacing admin tools or the book dashboard."
    panelLabel="Dashboards"
    panelTitle="Admin, main, and book dashboards are separate."
    panelText="Use this page for the planner pipeline. Use Book Dashboard for one book workspace. Use Admin Dashboard for admin records."
   />

   <div className="dashboard-grid">
    <section className="dashboard-main-links" aria-label="Dashboard links">
     <Link className="dashboard-main-link" to="/dashboard">
      <BookOpen size={20}/>
      <span>Main Dashboard</span>
     </Link>
     <Link className="dashboard-main-link" to="/books/dashboard">
      <PenLine size={20}/>
      <span>Book Dashboard</span>
     </Link>
     <Link className="dashboard-main-link" to="/admin">
      <ClipboardList size={20}/>
      <span>Admin Dashboard</span>
     </Link>
    </section>

    <section className="dashboard-main">
     <div className="dashboard-flow dashboard-flow-workflow">
      {plannerWorkflow.map(section=>(
       <DashboardSection
        key={section.id}
        id={section.id}
        kicker={section.kicker}
        title={section.title}
        linkTo={section.route}
        linkText="Open page"
       >
        <DashboardList
         items={section.items}
         icon={section.icon}
         getTitle={item=>item.title}
         metaBuilder={item=>item.meta}
        />
       </DashboardSection>
      ))}
     </div>
    </section>

    <DashboardQuickActions/>
   </div>
  </section>
 );
}

export default NovelPlannerDashboard;
