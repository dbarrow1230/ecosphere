import {Link} from "react-router-dom";
import {usePublicSite} from "../../../../shared/public/PublicSiteContext.jsx";
export default function Questions(){const {site}=usePublicSite();return (<div className="cafe-counter-answers"><aside><p>Before you visit</p><h1>{site.faqTitle||'At the counter'}</h1><p>{site.faqIntro}</p><Link to="/shop">Browse the café menu →</Link></aside><dl>{site.faq.map(([q,a])=><div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}</dl></div>);}
