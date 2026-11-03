import {Link} from "react-router-dom";
import {usePublicSite} from "../../../../shared/public/PublicSiteContext.jsx";
const copy=s=><>{s.text?.map(t=><p key={t}>{t}</p>)}{s.items&&<ul>{s.items.map(t=><li key={t}>{t}</li>)}</ul>}{s.note&&<p className="pw-note">{s.note}</p>}</>;
const contact=s=>"/contact?topic="+encodeURIComponent(s.title);
export default function Offerings({pageKey}){const {site}=usePublicSite();const page=site.pages.find(p=>p.slug===pageKey);if(!page)return <main><h1>Page not found</h1><Link to="/">Return home</Link></main>;return (<div className="occasion-planning-pages"><header><h1>{page.title}</h1><p>{page.intro}</p><Link to="/contact">Start your event brief ↗</Link></header><ol className="occasion-planning-path">{page.sections.map((s,i)=><li key={s.title} id={s.anchor||'offering-'+(i+1)}><span className="occasion-step">{i+1}</span><div><h2>{s.title}</h2>{copy(s)}<Link to={contact(s)}>Discuss this part of your event →</Link></div></li>)}</ol></div>);}
