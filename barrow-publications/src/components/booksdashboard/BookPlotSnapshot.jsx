function BookResearchSnapshot({researchNotes=0,sources=0,openQuestions=0}){
 const researchItems=[
  {label:"Research Notes",value:researchNotes},
  {label:"Sources",value:sources},
  {label:"Open Questions",value:openQuestions}
 ];

 return(
  <article className="book-dashboard-card book-research-snapshot">
   <div className="book-dashboard-card-header">
    <p className="book-dashboard-card-kicker">Research</p>
    <h2 className="book-dashboard-card-title">Research Snapshot</h2>
   </div>

   <ul className="book-dashboard-list">
    {researchItems.map(item=>(
     <li key={item.label}>
      <span>{item.label}</span>
      <strong>{item.value}</strong>
     </li>
    ))}
   </ul>
  </article>
 );
}

export default BookResearchSnapshot;