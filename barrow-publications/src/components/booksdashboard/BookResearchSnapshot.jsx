function BookResearchSnapshot(){
 const researchItems=[
  {label:"Research Notes",value:0},
  {label:"Sources",value:0},
  {label:"Open Questions",value:0}
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