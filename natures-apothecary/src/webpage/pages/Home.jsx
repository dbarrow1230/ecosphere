import {Link} from 'react-router-dom';
import {Leaf,ArrowUpRight} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
import {CatalogSection} from '../Commerce.jsx';
export default function Home(){const {site}=usePublicSite();return <>
 <section className="apothecary-frontispiece"><Leaf size={36}/><div><p className="pw-eyebrow">Nature’s Apothecary</p><h1>The apothecary shelves.</h1><p>Herbs, blends, and botanical preparations.</p></div><Link to="/ingredients">Read about ingredients<ArrowUpRight size={18}/></Link></section>
 <section className="apothecary-shelf-room"><CatalogSection heading="Explore the preparations"/><aside className="apothecary-specimen-note"><img src={site.hero} alt={site.heroAlt}/><p className="pw-eyebrow">Look closely</p><h2>Read the label.<br/>Ask the question.</h2><p>Ingredients and preparation details belong beside the product. Ask about a specific item before choosing.</p><Link to="/contact">Ask about a preparation<ArrowUpRight size={18}/></Link></aside></section>
 </>;}
