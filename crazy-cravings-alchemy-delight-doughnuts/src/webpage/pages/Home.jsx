import {Link} from 'react-router-dom';
import {ArrowRight,Sparkles} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
import {CatalogSection} from '../Commerce.jsx';
export default function Home(){const {site}=usePublicSite();return <>
 <section className="doughnut-shop-window"><div className="doughnut-display"><img src={site.hero} alt={site.heroAlt}/><span><Sparkles size={23}/>Classic · Specialty · Seasonal</span></div><div className="doughnut-window-copy"><p className="pw-eyebrow">Crazy Cravings</p><h1>A craving?<br/>Make it a<br/><em>doughnut.</em></h1><Link className="pw-button" to="/shop">Find your favorites<ArrowRight size={20}/></Link></div></section>
 <CatalogSection heading="What goes in your box?"/>
 <section className="doughnut-sharing-ticket"><div><p className="pw-eyebrow">Parties · Holidays · The office</p><h2>Bring something<br/>worth sharing.</h2></div><Link to="/celebrations">Talk celebration orders<ArrowRight size={24}/></Link></section>
 </>;}
