import {Link} from 'react-router-dom';
import {ArrowRight,BookOpen,PenLine} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
export default function Home(){const {site}=usePublicSite();return <>
 <section className="publishing-opening"><header><p className="pw-eyebrow">The publishing desk</p><h1>For the reader.<br/>For the writer.<br/>For the work.</h1></header><figure><img src={site.hero} alt={site.heroAlt}/><figcaption>From the manuscript to the published work</figcaption></figure><aside><span>Inside the imprint</span><Link to="/publishing"><BookOpen size={22}/><strong>Reader inquiries</strong><small>Books, authors, formats, and releases</small><ArrowRight size={18}/></Link><Link to="/authors"><PenLine size={22}/><strong>For writers</strong><small>Manuscripts and the submission conversation</small><ArrowRight size={18}/></Link></aside></section>
 <section className="publishing-editorial-note"><p className="pw-eyebrow">The work between the covers</p><h2>A manuscript begins a conversation.</h2><p>Editorial attention, production, and a clear path to the reader all have a part to play. Introduce your project or ask about the publishing work that interests you.</p><Link className="pw-text-link" to="/about">About the imprint<ArrowRight size={18}/></Link></section>
 </>;}
