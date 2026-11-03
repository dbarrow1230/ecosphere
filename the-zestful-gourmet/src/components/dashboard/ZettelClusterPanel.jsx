import {Link} from "react-router-dom";
import DashboardEmpty from "./DashboardEmpty.jsx";
import DashboardSection from "./DashboardSection.jsx";

function ZettelClusterPanel({title,kicker,clusters=[],loading=false,emptyMessage,showTimer=false}){
 return <DashboardSection className="dashboard-zettel-clusters" kicker={kicker} title={title} linkTo="/notes" linkLabel="Browse zettels">
  {loading?<DashboardEmpty message="Loading zettels…"/>:clusters.length?<ul className="dashboard-cluster-list">{clusters.map(cluster=><li className="dashboard-cluster" key={cluster.main._id}><Link className="dashboard-cluster-main" to={`/notes/${cluster.main._id}`}><span className="dashboard-item-title">{cluster.main.title}</span><span className="dashboard-item-meta">{showTimer?cluster.timer:cluster.meta}</span></Link>{cluster.links.length?<ul className="dashboard-cluster-links">{cluster.links.map(item=><li key={item._id}><Link to={`/notes/${item._id}`}>{item.title}</Link></li>)}</ul>:null}</li>)}</ul>:<DashboardEmpty message={emptyMessage}/>} 
 </DashboardSection>;
}
export default ZettelClusterPanel;
