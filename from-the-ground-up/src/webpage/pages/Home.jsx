import {Link} from 'react-router-dom';
import {Heart,HandHeart,ArrowRight} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
export default function Home(){const {site}=usePublicSite();return <>
 <section className="renewal-campaign"><img src={site.hero} alt={site.heroAlt}/><header><p className="pw-eyebrow">From The Ground Up</p><h1>A place to begin again.</h1><p>Housing restoration, practical skills, community meals, and a pathway toward stability and dignity.</p></header><Link className="renewal-give" to="/donate"><Heart size={28}/><span>Support the work</span><ArrowRight size={22}/></Link></section>
 <section className="renewal-community-doorways"><article><HandHeart size={36}/><p className="pw-eyebrow">Find support</p><h2>Explore the<br/>programs.</h2><p>Learn about restoration, workforce learning, and community support.</p><Link to="/programs">A way forward<ArrowRight size={20}/></Link></article><article><Heart size={36}/><p className="pw-eyebrow">Take part</p><h2>Bring your time,<br/>skills, or support.</h2><p>Volunteer, connect your organization, or make a donation pledge.</p><Link to="/involvement">Ways to participate<ArrowRight size={20}/></Link></article></section>
 <section className="renewal-purpose-line"><h2>More than rebuilding walls.</h2><p>People, dignity, useful skills, and participation are part of rebuilding a life and a community.</p><Link className="pw-button" to="/donate">Help sustain the mission<Heart size={18}/></Link></section>
 </>;}
