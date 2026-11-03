import {Link} from "react-router-dom";
import {usePublicSite} from "../../../../shared/public/PublicSiteContext.jsx";
export default function Questions(){const {site}=usePublicSite();return (<article className="kitchen-pass-answers"><header><p>Across the kitchen pass</p><h1>{site.faqTitle||'A conversation with the kitchen'}</h1><p>{site.faqIntro}</p></header>{site.faq.map(([q,a])=><div key={q}><h2>{q}</h2><blockquote><p>{a}</p></blockquote></div>)}<Link to="/contact">Continue the conversation →</Link></article>);}
