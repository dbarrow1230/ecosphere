import DashboardSection from "./DashboardSection.jsx";

function MissingRecipeDataPanel({recipes=[]}){
 return(
  <DashboardSection className="dashboard-panel-missing" kicker="Data Quality" title="Recipes Missing Details">
   {recipes.length?(
    <div className="dashboard-list">
     {recipes.map(recipe=>(
      <article className="dashboard-list-item" key={recipe._id}>
       <div className="dashboard-list-content">
        <strong className="dashboard-item-title">{recipe.name}</strong>
        <span className="dashboard-item-meta">{recipe.note||"Recipe details are incomplete"}</span>
       </div>
      </article>
     ))}
    </div>
   ):<p className="dashboard-empty">No missing recipe details found.</p>}
  </DashboardSection>
 );
}

export default MissingRecipeDataPanel;
