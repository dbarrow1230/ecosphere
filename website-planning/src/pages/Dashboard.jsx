import {Link} from "react-router-dom";
import "../styles/Dashboard.css";

const sections=[
 {title:"Websites",text:"Define each website, its purpose, audience, domain, owner, and current stage.",to:"/websites"},
 {title:"Pages",text:"Plan page hierarchy, titles, routes, descriptions, and publishing status.",to:"/pages"},
 {title:"Content",text:"Organize copy, media requirements, calls to action, and content ownership.",to:"/content"},
 {title:"Tasks",text:"Track design, development, review, accessibility, and launch work.",to:"/tasks"}
];

export default function Dashboard(){
 return <main className="dashboard-page">
  <section className="dashboard-hero"><div><p className="dashboard-kicker">Website planning workspace</p><h2>Website Planning</h2><p>Move each website from purpose and structure through content, design, review, and publishing.</p></div><div className="dashboard-overview"><strong>Connected planning</strong><span>Websites, pages, navigation, content, assets, tasks, and launch readiness in one application.</span></div></section>
  <section className="dashboard-section"><div className="section-heading"><div><p className="dashboard-kicker">Core records</p><h3>Planning areas</h3></div></div><div className="dashboard-grid">{sections.map(item=><Link className="dashboard-card" to={item.to} key={item.title}><h4>{item.title}</h4><p>{item.text}</p><span>Open {item.title} →</span></Link>)}</div></section>
  <section className="dashboard-section"><p className="dashboard-kicker">Workflow</p><h3>From idea to published site</h3><div className="workflow-row"><div><strong>1. Define</strong><span>Purpose, audience, scope, and ownership.</span></div><div><strong>2. Structure</strong><span>Pages, navigation, routes, and relationships.</span></div><div><strong>3. Produce</strong><span>Copy, images, assets, design, and development.</span></div><div><strong>4. Publish</strong><span>Review, accessibility, launch, and maintenance.</span></div></div></section>
 </main>;
}
