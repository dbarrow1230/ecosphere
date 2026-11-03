import {Link} from "react-router-dom";
import {usePublicSite} from "../../../../shared/public/PublicSiteContext.jsx";
export default function Questions(){const {site}=usePublicSite();return (<div className="renewal-open-house"><header><p>Our community, in conversation</p><h1>{site.faqTitle||'Before you get involved'}</h1><p>{site.faqIntro}</p></header><div className="renewal-community-wall">{site.faq.map(([q,a])=><article key={q}><h2>{q}</h2><p>{a}</p></article>)}</div><footer><h2>Your questions help shape the conversation.</h2><Link to="/contact">Talk with us →</Link></footer></div>);}
