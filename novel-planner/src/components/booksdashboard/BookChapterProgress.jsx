function BookChapterProgress({planned=0,drafting=0,revising=0,complete=0}){
 const chapters=[
  {label:"Planned",value:planned},
  {label:"Drafting",value:drafting},
  {label:"Revising",value:revising},
  {label:"Complete",value:complete}
 ];

 return(
  <article className="book-dashboard-card book-chapter-progress">
   <div className="book-dashboard-card-header">
    <p className="book-dashboard-card-kicker">Chapters</p>
    <h2 className="book-dashboard-card-title">Chapter Progress</h2>
   </div>

   <ul className="book-dashboard-list">
    {chapters.map(item=>(
     <li key={item.label}>
      <span>{item.label}</span>
      <strong>{item.value}</strong>
     </li>
    ))}
   </ul>
  </article>
 );
}

export default BookChapterProgress;