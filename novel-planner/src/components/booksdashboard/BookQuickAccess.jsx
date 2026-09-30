// src/components/booksdashboard/BookQuickAccess.jsx
import {useEffect,useState} from "react";
import {createPortal} from "react-dom";
import {
 BookOpen,
 Building2,
 ChevronLeft,
 ChevronRight,
 FileText,
 Globe2,
 Landmark,
 ListTree,
 Users,
 X
} from "lucide-react";
import {Link} from "react-router-dom";
import "./BookQuickAccess.css";

function BookQuickAccess({book=null,plannerBase=""}){
 const [open,setOpen]=useState(false);
 const disabled=!book;

 useEffect(()=>{
  document.body.classList.toggle("book-quick-access-open",open);

  return()=>{
   document.body.classList.remove("book-quick-access-open");
  };
 },[open]);

 useEffect(()=>{
  const handleKeyDown=event=>{
   if(event.key==="Escape")setOpen(false);
  };

  window.addEventListener("keydown",handleKeyDown);

  return()=>{
   window.removeEventListener("keydown",handleKeyDown);
  };
 },[]);

 const links=[
  {
   label:"World",
   icon:<Globe2 size={16}/>,
   path:"/planner/world-building"
  },
  {
   label:"Chapter Outline",
   icon:<BookOpen size={16}/>,
   path:"/planner/chapters-scenes"
  },
  {
   label:"Characters Summary",
   icon:<FileText size={16}/>,
   path:"/planner/characters"
  },
  {
   label:"Characters",
   icon:<Users size={16}/>,
   path:"/planner/characters"
  },
  {
   label:"Realms / Cities",
   icon:<Building2 size={16}/>,
   path:"/planner/world-building"
  },
  {
   label:"Organizations",
   icon:<Landmark size={16}/>,
   path:"/planner/world-building"
  }
 ];

 const closeDrawer=()=>{
  setOpen(false);
 };

 const drawer=(
  <>
   {open?(
    <div
     className="book-quick-access-backdrop"
     onClick={closeDrawer}
     onMouseMove={event=>event.stopPropagation()}
     onMouseEnter={event=>event.stopPropagation()}
    ></div>
   ):null}

   <button
    type="button"
    className={`book-quick-access-tab${open?" open":""}`}
    onClick={()=>setOpen(prev=>!prev)}
    aria-expanded={open}
    aria-controls="book-quick-access-drawer"
   >
    {open?<ChevronRight size={18}/>:<ChevronLeft size={18}/>}
    <span>Quick Access</span>
   </button>

   <aside
    id="book-quick-access-drawer"
    className={`book-quick-access-drawer${open?" open":""}`}
    aria-hidden={!open}
   >
    <div className="book-quick-access-header">
     <div>
      <p>Book Tools</p>
      <h2>Quick Access</h2>
     </div>

     <button type="button" onClick={closeDrawer} aria-label="Close quick access">
      <X size={18}/>
     </button>
    </div>

    <div className="book-quick-access-book">
     <ListTree size={18}/>
     <div>
      <strong>{book?.title||"No book selected"}</strong>
      <span>{book?.status||"Select a book to enable links"}</span>
     </div>
    </div>

    <nav className="book-quick-access-list">
     {links.map(item=>(
      disabled?(
       <span className="book-quick-access-link disabled" key={item.label}>
        {item.icon}
        <span>{item.label}</span>
       </span>
      ):(
       <Link
        className="book-quick-access-link"
        to={`${plannerBase}${item.path}`}
        key={item.label}
        onClick={closeDrawer}
       >
        {item.icon}
        <span>{item.label}</span>
       </Link>
      )
     ))}
    </nav>
   </aside>
  </>
 );

 if(typeof document==="undefined")return null;

 return createPortal(drawer,document.body);
}

export default BookQuickAccess;
