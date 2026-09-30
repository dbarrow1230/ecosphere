import DashboardSection from "./DashboardSection.jsx";

function RecentRecipesPanel({recipes=[]}){
 return(
  <DashboardSection className="dashboard-panel-recent" kicker="Recent Activity" title="Recently Added Recipes">
   {recipes.length?(
    <div className="dashboard-list dashboard-list-two-column">
     {recipes.map(recipe=>(
      <article className="dashboard-list-item" key={recipe._id}>
       <div className="dashboard-list-content">
        <strong className="dashboard-item-title">{recipe.name}</strong>
        <span className="dashboard-item-meta">{recipe.category||"Uncategorized"}</span>
       </div>
      </article>
     ))}
    </div>
   ):<p className="dashboard-empty">No recent recipes found.</p>}
  </DashboardSection>
 );
}

export default RecentRecipesPanel;
