function BookProjectStatus({book=null,onEdit}){
 return(
  <article className="book-dashboard-card book-project-status">
   <div className="book-dashboard-card-header">
    <p className="book-dashboard-card-kicker">Project</p>
    <h2 className="book-dashboard-card-title">Book Status</h2>
   </div>

   <div className="book-dashboard-card-body">
    <p className="book-dashboard-main-value">{book?.title||"No book selected"}</p>
    <p className="book-dashboard-card-text">
     {book?.genre?`${book.genre} • ${book?.status||"Status not set"}`:book?.status||"Draft stage, genre, target audience, and current book phase will display here."}
    </p>

    {book&&onEdit?(
     <button type="button" className="book-desk-note-action" onClick={onEdit}>
      Edit Book
     </button>
    ):null}
   </div>
  </article>
 );
}

export default BookProjectStatus;