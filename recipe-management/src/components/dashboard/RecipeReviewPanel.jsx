import DashboardSection from "./DashboardSection.jsx";

function RecipeReviewPanel({recipes=[]}){
 return(
  <DashboardSection className="dashboard-panel-review" kicker="Review Queue" title="Recipes To Review">
   {recipes.length?(
    <div className="dashboard-list">
     {recipes.map(recipe=>(
      <article className="dashboard-list-item" key={recipe._id}>
       <div className="dashboard-list-content">
        <strong className="dashboard-item-title">{recipe.name}</strong>
        <span className="dashboard-item-meta">{recipe.category||"Uncategorized"} · {recipe.quantity||"Review needed"}</span>
       </div>
      </article>
     ))}
    </div>
   ):<p className="dashboard-empty">No recipes need review.</p>}
  </DashboardSection>
 );
}

export default RecipeReviewPanel;
