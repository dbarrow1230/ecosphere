import {Link} from "react-router-dom";
import {usePublicSite} from "../../../../shared/public/PublicSiteContext.jsx";
export default function Questions(){const {site}=usePublicSite();return (<article className="press-correspondence"><header><p>Reader & writer correspondence</p><h1>{site.faqTitle||'Notes from the publisher'}</h1><p>{site.faqIntro}</p></header>{site.faq.map(([q,a],i)=><section key={q}><span>Letter {String(i+1).padStart(2,'0')}</span><div><h2>{q}</h2><p>{a}</p></div></section>)}<footer><Link to="/contact">Send a question to the imprint →</Link></footer></article>);}
