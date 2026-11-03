import {Link} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,Leaf,ShoppingBasket,ShieldCheck} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
export default function About(){const {site,name}=usePublicSite();const paragraphs=(site.about||site.story||[]).map(text=><p key={text}>{text}</p>);const values=site.values.map(item=><article key={item.title}><h2>{item.title}</h2><p>{item.text}</p></article>);return <div className="business-about"><section className="kitchen-notebook"><figure><img src={site.hero} alt={site.heroAlt}/><figcaption>From the kitchen</figcaption></figure><article><p className="pw-eyebrow">The food philosophy</p><h1>{site.aboutTitle}</h1>{paragraphs}<section>{values}</section></article></section></div>;}
