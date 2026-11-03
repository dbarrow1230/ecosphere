import {Link} from "react-router-dom";
import {usePublicSite} from "../../../../shared/public/PublicSiteContext.jsx";
export default function Questions(){const {site}=usePublicSite();return (<div className="grocer-service-desk"><aside><h1>{site.faqTitle||'At the service desk'}</h1><p>{site.faqIntro}</p><Link to="/shop">Back to the shelves →</Link></aside><div>{site.faq.map(([q,a])=><section key={q}><h2>{q}</h2><p>{a}</p></section>)}<Link to="/contact">Speak with the grocer ↗</Link></div></div>);}
