import {Link} from "react-router-dom";
import {usePublicSite} from "../../../../shared/public/PublicSiteContext.jsx";
export default function Questions(){const {site}=usePublicSite();return (<div className="cravings-question-box"><header><h1>{site.faqTitle||'A box of answers'}</h1><p>{site.faqIntro}</p></header><div>{site.faq.map(([q,a],i)=><details key={q}><summary><span>{String(i+1).padStart(2,'0')}</span>{q}</summary><p>{a}</p></details>)}</div><Link to="/contact">Still curious? Ask us →</Link></div>);}
