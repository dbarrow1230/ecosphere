import {Link} from "react-router-dom";
import "../styles/Dashboard.css";

const sections=[
 {title:"Recipes",text:"Develop dishes using seasonal, local, and responsibly produced ingredients.",to:"/recipes"},
 {title:"Menus",text:"Build menus around seasonality, availability, nutrition, and low-waste preparation.",to:"/menus"},
 {title:"Ingredients",text:"Organize ingredients, growing methods, sourcing notes, and availability.",to:"/ingredients"},
 {title:"Food Resources",text:"Maintain growers, producers, preservation methods, and regenerative references.",to:"/resources"}
];

export default function Dashboard(){
 return <main className="dashboard-page">
  <section className="dashboard-hero"><div><p className="dashboard-kicker">Regenerative cuisine workspace</p><h2>Regenerative Earth Cuisine</h2><p>Plan food from soil and source through preparation, preservation, service, and reuse.</p></div><div className="dashboard-overview"><strong>Living food system</strong><span>Recipes, menus, ingredients, growers, methods, and seasonal planning in one application.</span></div></section>
  <section className="dashboard-section"><div className="section-heading"><div><p className="dashboard-kicker">Core records</p><h3>Cuisine planning</h3></div></div><div className="dashboard-grid">{sections.map(item=><Link className="dashboard-card" to={item.to} key={item.title}><h4>{item.title}</h4><p>{item.text}</p><span>Open {item.title} →</span></Link>)}</div></section>
  <section className="dashboard-section"><p className="dashboard-kicker">Workflow</p><h3>From the earth to the table</h3><div className="workflow-row"><div><strong>1. Source</strong><span>Record seasonal ingredients and producers.</span></div><div><strong>2. Develop</strong><span>Create recipes and preservation methods.</span></div><div><strong>3. Plan</strong><span>Arrange dishes into practical menus.</span></div><div><strong>4. Review</strong><span>Track waste, reuse, and improvements.</span></div></div></section>
 </main>;
}
