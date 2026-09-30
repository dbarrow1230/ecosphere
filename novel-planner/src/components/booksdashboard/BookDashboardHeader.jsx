import {BookOpen} from "lucide-react";
import {Button} from "react-bootstrap";

function BookDashboardHeader({
 kicker="Book Dashboard",
 title="Current Book Workspace",
 text="Track this book’s progress, chapters, characters, plot, writing goals, research, and deadlines.",
 activeBook=null,
 onCreateBook,
 onEditBook
}){
 return(
  <header className="book-dashboard-header">
   <div className="book-dashboard-header-main">
    <p className="book-dashboard-kicker">{kicker}</p>
    <h1 className="book-dashboard-title">{title}</h1>
    <p className="book-dashboard-text">{text}</p>

    {onCreateBook?(
     <div className="book-desk-hero-actions">
      <Button type="button" onClick={onCreateBook}>
       <BookOpen size={18}/>
       New Book
      </Button>
      {activeBook&&onEditBook?(
       <Button type="button" variant="outline-primary" onClick={onEditBook}>
        Edit Book
       </Button>
      ):null}
     </div>
    ):null}
   </div>

   <aside className="book-dashboard-header-panel">
    <p className="book-dashboard-panel-label">Active Project</p>
    <h2>{activeBook?.title||"No book selected"}</h2>
    <p>{activeBook?.status||"No active project"}{activeBook?.statusHistory?.length?` · Revision ${activeBook.statusHistory.length-1}`:""}</p>
   </aside>
  </header>
 );
}

export default BookDashboardHeader;
