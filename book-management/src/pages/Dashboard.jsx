// src/pages/Dashboard.jsx
import {useEffect,useMemo,useState} from "react";
import {useIcons} from "@shared";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import DashboardActions from "../components/dashboard/DashboardActions.jsx";
import DashboardVisualBoard from "../components/dashboard/DashboardVisualBoard.jsx";
import {getArray,isActiveLoan,getAuthorMap,getBookTitle} from "../components/dashboard/dashboardUtils.js";
import "../styles/Dashboard.css";

function Dashboard(){

 const {FontAwesomeIcons,LucideIcons}=useIcons();

 const [books,setBooks]=useState([]);
 const [authors,setAuthors]=useState([]);
 const [publishers,setPublishers]=useState([]);
 const [loans,setLoans]=useState([]);
 const [readingGoal,setReadingGoal]=useState(null);
 const [readingPlans,setReadingPlans]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 const authorMap=useMemo(()=>getAuthorMap(authors),[authors]);

 const normalizedReadingPlans=useMemo(()=>readingPlans.map(plan=>{
  const book=plan?.book&&typeof plan.book==="object"?plan.book:null;
  const days=Array.isArray(plan?.daysOfWeek)?plan.daysOfWeek:[];

  return{
   _id:plan._id||plan.id||plan.name,
   name:plan.name,
   subject:plan.subject||"General",
   bookId:book?._id||plan.book,
   bookTitle:book?getBookTitle(book):plan.name,
   daysOfWeek:days,
   daysLabel:days.map(day=>day.slice(0,3)).join(", "),
   startDate:plan.startDate,
   endDate:plan.endDate
  };
 }),[readingPlans]);

 const readingCalendarEvents=useMemo(()=>{
  const labels=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const today=new Date();
  const monthStart=new Date(today.getFullYear(),today.getMonth(),1);
  const rangeStart=new Date(monthStart);
  rangeStart.setDate(monthStart.getDate()-7);
  const rangeEnd=new Date(today.getFullYear(),today.getMonth()+1,7);
  const events=[];

  normalizedReadingPlans.forEach(plan=>{
   if(plan.daysOfWeek.length){
    for(const date=new Date(rangeStart);date<=rangeEnd;date.setDate(date.getDate()+1)){
     const dayKey=labels[date.getDay()];
     if(!plan.daysOfWeek.includes(dayKey))continue;
     const start=new Date(date);
     start.setHours(9,0,0,0);
     const end=new Date(start);
     end.setHours(10,0,0,0);
     events.push({
      id:`${plan._id}-${start.toISOString()}`,
      title:`${plan.subject}: ${plan.bookTitle}`,
      start,
      end,
      resource:plan
     });
    }
    return;
   }

   if(plan.startDate){
    const start=new Date(plan.startDate);
    start.setHours(9,0,0,0);
    const end=new Date(start);
    end.setHours(10,0,0,0);
    events.push({
     id:`${plan._id}-${start.toISOString()}`,
     title:`${plan.subject}: ${plan.bookTitle}`,
     start,
     end,
     resource:plan
    });
   }
  });

  return events;
 },[normalizedReadingPlans]);

 useEffect(()=>{
  let ignore=false;

  const loadDashboard=async()=>{
   try{
    setLoading(true);
    setError("");

    const res=await fetch("/api/dashboard/library-summary",{
     cache:"no-store",
     headers:{"Content-Type":"application/json"}
    });
    const data=await res.json();

    if(!res.ok)throw new Error(data?.message||"Failed to load dashboard summary");

    if(ignore)return;

    setBooks(getArray(data?.books));
    setAuthors(getArray(data?.authors));
    setPublishers(getArray(data?.publishers));
    setLoans(getArray(data?.loans));
    setReadingGoal(data?.readingGoal||null);
    setReadingPlans(getArray(data?.readingPlans));
   }catch(err){
    if(ignore)return;
    setError(err?.message||"Failed to load dashboard.");
    setBooks([]);
    setAuthors([]);
    setPublishers([]);
    setLoans([]);
    setReadingGoal(null);
    setReadingPlans([]);
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadDashboard();

  return()=>{
   ignore=true;
  };
 },[]);

 return(
  <section className="dashboard">
   <DashboardHeader
    loading={loading}
    error={error}
    totalBooks={books.length}
    activeLoans={loans.filter(isActiveLoan).length}
    authorsCount={authors.length}
    publishersCount={publishers.length}
    dashboardIcon={FontAwesomeIcons.Dashboard}
   />

   <div className="dashboard-grid">
    <div className="dashboard-main">
     <DashboardVisualBoard
      books={books}
      authors={authors}
      publishers={publishers}
      loans={loans}
      authorMap={authorMap}
      readingGoal={readingGoal}
      readingPlans={normalizedReadingPlans}
      readingCalendarEvents={readingCalendarEvents}
     />
    </div>

    <aside className="dashboard-sidebar">
      <DashboardActions
       plusIcon={LucideIcons.Plus}
       bookIcon={FontAwesomeIcons.Book}
       authorIcon={LucideIcons.NotebookPen}
       publisherIcon={LucideIcons.FileText}
      />
    </aside>
   </div>
  </section>
 );
}

export default Dashboard;
