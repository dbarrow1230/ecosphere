import {Link} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,Leaf,ShoppingBasket,ShieldCheck} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
export default function About(){const {site,name}=usePublicSite();const paragraphs=(site.about||site.story||[]).map(text=><p key={text}>{text}</p>);const values=site.values.map(item=><article key={item.title}><h2>{item.title}</h2><p>{item.text}</p></article>);return <div className="business-about"><section className="occasion-story"><figure><img src={site.hero} alt={site.heroAlt}/><figcaption>{name}</figcaption></figure><header><h1>{site.aboutTitle}</h1><p>{site.aboutIntro}</p></header><article>{paragraphs}</article><div className="occasion-details">{values}</div></section></div>;}
