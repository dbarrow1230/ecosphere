import {Link} from 'react-router-dom';
import {ArrowUpRight,Utensils} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
export default function Home(){const {site}=usePublicSite();return <>
 <section className="kitchen-service-window"><img src={site.hero} alt={site.heroAlt}/><div className="kitchen-menu-slip"><Utensils size={35}/><p className="pw-eyebrow">From the kitchen</p><h1>Seasonally inspired.<br/>Grounded in flavor.</h1><Link className="pw-button" to="/menu">Open the current menu<ArrowUpRight size={20}/></Link></div></section>
 <section className="kitchen-working-notes"><header><p className="pw-eyebrow">The thinking behind the dish</p><h2>Start with<br/>the ingredients.</h2></header><dl><div><dt>Ingredients</dt><dd>Fresh produce, responsibly sourced proteins, and whole ingredients.</dd></div><div><dt>Craft</dt><dd>Balance, texture, and care in how each dish comes together.</dd></div><div><dt>Use what the kitchen brings</dt><dd>Cross-utilization, thoughtful purchasing, and less avoidable waste.</dd></div></dl></section>
 <section className="kitchen-table-inquiry"><span>Have a meal or occasion in mind?</span><Link to="/contact">Talk to the kitchen<ArrowUpRight size={20}/></Link></section>
 </>;}
