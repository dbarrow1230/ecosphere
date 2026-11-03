import {Link} from 'react-router-dom';
import {Leaf,ArrowRight} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
import {CatalogSection} from '../Commerce.jsx';
export default function Home(){const {site}=usePublicSite();return <>
 <section className="grocery-shopping-floor"><div className="grocery-aisle"><header><p className="pw-eyebrow">The grocery selection</p><h1>Good food belongs<br/>on the table.</h1></header><CatalogSection heading="What’s available"/></div><aside className="grocery-rescue-board"><img src={site.hero} alt={site.heroAlt}/><Leaf size={35}/><h2>Beautiful food.<br/>Imperfect looks.</h2><p>Give overlooked produce and surplus groceries a place in your household.</p><Link to="/food-waste">Why rescued groceries?<ArrowRight size={18}/></Link></aside></section>
 <section className="grocery-harvest-message"><h2>Respect the harvest.</h2><p>Shape, size, and a few freckles should not decide whether good food gets eaten.</p><Link to="/about">Get to know Green Table<ArrowRight size={18}/></Link></section>
 </>;}
