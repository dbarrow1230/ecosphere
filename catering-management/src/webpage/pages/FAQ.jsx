import {Link} from "react-router-dom";
import {usePublicSite} from "../../../../shared/public/PublicSiteContext.jsx";
export default function Questions(){const {site}=usePublicSite();return (<div className="occasion-planning-notes"><header><p>Your event notebook</p><h1>{site.faqTitle||'Before we set the table'}</h1><p>{site.faqIntro}</p></header><div>{site.faq.map(([q,a],i)=><article key={q}><span>Planning note {i+1}</span><h2>{q}</h2><p>{a}</p></article>)}</div><aside><h2>Let’s talk about your occasion.</h2><Link to="/contact">Open your event brief ↗</Link></aside></div>);}
