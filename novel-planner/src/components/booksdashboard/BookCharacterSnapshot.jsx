function BookCharacterSnapshot({mainCharacters=0,profilesStarted=0,arcsPlanned=0}){
 const characters=[
  {label:"Main Characters",value:mainCharacters},
  {label:"Profiles Started",value:profilesStarted},
  {label:"Arcs Planned",value:arcsPlanned}
 ];

 return(
  <article className="book-dashboard-card book-character-snapshot">
   <div className="book-dashboard-card-header">
    <p className="book-dashboard-card-kicker">Characters</p>
    <h2 className="book-dashboard-card-title">Cast Snapshot</h2>
   </div>

   <ul className="book-dashboard-list">
    {characters.map(item=>(
     <li key={item.label}>
      <span>{item.label}</span>
      <strong>{item.value}</strong>
     </li>
    ))}
   </ul>
  </article>
 );
}

export default BookCharacterSnapshot;