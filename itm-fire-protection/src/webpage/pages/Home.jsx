import {Link} from 'react-router-dom';
import {ShieldCheck,ShoppingBasket,ArrowUpRight,Flame} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
import {CatalogSection} from '../Commerce.jsx';
export default function Home(){const {site}=usePublicSite();return <>
 <section className="fire-dispatch-opening"><div className="fire-dispatch-title"><ShieldCheck size={52}/><p className="pw-eyebrow">ITM Fire Protection</p><h1>Inspection.<br/>Testing.<br/>Maintenance.</h1></div><div className="fire-dispatch-choices"><Link to="/service-request"><Flame size={32}/><h2>Service for<br/>your property.</h2><p>Inspection, testing, maintenance, repairs, and recharging inquiries.</p><span>Request service<ArrowUpRight size={20}/></span></Link><Link to="/shop"><ShoppingBasket size={32}/><h2>Equipment for<br/>its protection.</h2><p>Extinguishers, detectors, cabinets, signs, and accessories.</p><span>Find equipment<ArrowUpRight size={20}/></span></Link></div></section>
 <section className="fire-equipment-bench"><img src={site.hero} alt={site.heroAlt}/><div><h2>Choose the path<br/>your property needs.</h2><p>Start with an equipment inquiry or tell us about your service requirements.</p></div></section>
 <CatalogSection heading="Equipment selection" limit={8}/>
 </>;}
