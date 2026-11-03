import {Link} from "react-router-dom";
import DashboardEmpty from "./DashboardEmpty.jsx";
import DashboardSection from "./DashboardSection.jsx";

function ZettelClusterPanel({title,kicker,clusters=[],loading=false,emptyMessage}){
 return <DashboardSection className="dashboard-zettel-clusters" kicker={kicker} title={title} linkTo="/notes" linkLabel="Browse zettels">
  {loading?<DashboardEmpty message="Loading zettels…"/>:clusters.length?<>
   <p className="dashboard-cluster-summary">{clusters.length} connected group{clusters.length===1?"":"s"}</p>
   <ul className="dashboard-cluster-list">{clusters.map(cluster=><li className="dashboard-cluster" key={cluster.id}>
    <details className="dashboard-cluster-accordion">
     <summary className="dashboard-cluster-main">
      <span className="dashboard-item-title">{cluster.name}</span>
      <span className="dashboard-item-meta">{cluster.memberCount} zettels · {cluster.connectionCount} saved connection{cluster.connectionCount===1?"":"s"}</span>
     </summary>
     <ul className="dashboard-cluster-links">{cluster.members.map(item=><li key={item._id}><Link to={`/notes/${item._id}`}>{item.title}</Link></li>)}</ul>
    </details>
   </li>)}</ul>
  </>:<DashboardEmpty message={emptyMessage}/>}
 </DashboardSection>;
}
export default ZettelClusterPanel;
