import {Link} from "react-router-dom";
import DashboardSection from "./DashboardSection.jsx";

const id=value=>typeof value==="object"?value?._id||"":value||"";
export function costingOverview(recipes=[],costings=[]){
 const active=recipes.filter(recipe=>recipe.isActive!==false);
 const current=costings.filter(costing=>costing.isActive!==false);
 const covered=new Set(current.map(costing=>`${id(costing.business)}:${id(costing.recipe)}`));
 return {
  costed:active.filter(recipe=>covered.has(`${id(recipe.business)}:${id(recipe)}`)).length,
  uncosted:active.filter(recipe=>!covered.has(`${id(recipe.business)}:${id(recipe)}`)),
  recent:[...current].sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0)).slice(0,5)
 };
}
export default function CostingOverviewPanel({recipes=[],costings=[]}){
 const overview=costingOverview(recipes,costings);
 return <DashboardSection title="Recipe Costing">
  <div className="d-flex flex-wrap gap-4 mb-3"><span>Costed recipes: <strong>{overview.costed}</strong></span><span>Without costing: <strong>{overview.uncosted.length}</strong></span></div>
  {overview.recent.length?<div className="dashboard-list">{overview.recent.map(costing=><Link className="dashboard-list-item" key={id(costing)} to={`/recipe-costings?recipe=${encodeURIComponent(id(costing.recipe))}`}><strong>{costing.recipe?.name||recipes.find(recipe=>id(recipe)===id(costing.recipe))?.name||"Recipe"}</strong><span>Cost: ${Number(costing.totals?.totalCost||0).toFixed(2)} · Selling price: ${Number(costing.pricing?.suggestedPrice||0).toFixed(2)}</span></Link>)}</div>:null}
  <Link className="btn btn-outline-primary mt-3" to="/recipe-costings">Recipe Costing</Link>
 </DashboardSection>;
}
