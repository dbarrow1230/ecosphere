import {Link} from 'react-router-dom';
import {Coffee,ArrowRight} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
import {CatalogSection} from '../Commerce.jsx';
export default function Home(){const {site,business}=usePublicSite();return <>
 <section className="coffee-counter-scene"><div className="coffee-window"><img src={site.hero} alt={site.heroAlt}/><h1>Your coffee break.</h1></div><aside className="coffee-order-board"><Coffee size={42}/><p className="pw-eyebrow">At the counter</p><h2>Something to sip.<br/>Something alongside.</h2><p>Coffee, freshly baked pastries, and café favorites. Find the current selection before you build your basket.</p><Link className="pw-button" to="/shop">See the café menu<ArrowRight size={18}/></Link>{business?.addressLine1&&<address>{business.addressLine1}<br/>{business.city}</address>}</aside></section>
 <CatalogSection heading="From the café menu"/>
 <section className="coffee-gathering-slip"><p>Bringing people together?</p><h2>Make coffee part of the gathering.</h2><Link to="/gatherings">Workplace breaks & small get-togethers<ArrowRight size={20}/></Link></section>
 </>;}
