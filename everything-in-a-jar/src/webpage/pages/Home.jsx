import {Link} from 'react-router-dom';
import {Leaf,ArrowUpRight} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
import {CatalogSection} from '../Commerce.jsx';
export default function Home(){const {site}=usePublicSite();return <>
 <section className="pantry-shelf-opening"><div className="pantry-batch-label"><Leaf size={38}/><p className="pw-eyebrow">Everything in a Jar</p><h1>Keep the season.<br/>Open the possibilities.</h1><p>Preserves, ferments, chutneys, cheeses, and freeze-dried ingredients, with Caribbean culinary roots.</p><Link className="pw-button" to="/shop">Open the pantry<ArrowUpRight size={18}/></Link><span>Small-batch craft · Thoughtful use of ingredients</span></div><img src={site.hero} alt={site.heroAlt}/><aside><Link to="/batches">Seasonal batches</Link><Link to="/about">The story in the jar</Link></aside></section>
 <CatalogSection heading="On the pantry shelf"/>
 <section className="pantry-preserving-note"><strong>Waste less.<br/>Keep more possibility.</strong><p>Seasonal produce and culinary craft belong in the same story. Find out how preservation and small-batch making shape the pantry.</p><Link to="/about">Behind the pantry</Link></section>
 </>;}
