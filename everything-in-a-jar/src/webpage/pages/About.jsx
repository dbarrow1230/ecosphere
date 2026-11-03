import {Link} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,Leaf,ShoppingBasket,ShieldCheck} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
export default function About(){const {site,name}=usePublicSite();const paragraphs=(site.about||site.story||[]).map(text=><p key={text}>{text}</p>);const values=site.values.map(item=><article key={item.title}><h2>{item.title}</h2><p>{item.text}</p></article>);return <div className="business-about"><section className="pantry-origin"><aside><Leaf size={44}/><h1>{site.aboutTitle}</h1><p>{site.aboutIntro}</p></aside><article><img src={site.hero} alt={site.heroAlt}/>{paragraphs}<div className="pantry-notes">{values}</div></article></section></div>;}
