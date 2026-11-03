import {Link} from "react-router-dom";

export default function AttentionPanel({items=[]}){
 return <section className="dashboard-section dashboard-attention-panel" aria-label="Attention queue">
  <div className="dashboard-section-head"><div><p className="dashboard-section-kicker">Attention queue</p><h2 className="dashboard-section-title">Needs attention</h2></div></div>
  {items.length?<ul>{items.map(item=><li key={item.key||item.title}><Link to={item.to||`/notes/${encodeURIComponent(item.key)}?returnTo=/dashboard`}><strong>{item.title}</strong><span>{item.meta}</span></Link></li>)}</ul>:<p className="mb-0">No notes need attention right now.</p>}
 </section>;
}
