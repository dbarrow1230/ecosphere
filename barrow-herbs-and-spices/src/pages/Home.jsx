import hero from '../images/hero_image.png';
import {Link} from 'react-router-dom';
import usePublicBusiness from '@shared/public/usePublicBusiness.js';
import {getRuntimeAppKey} from '../utils/currentBusiness.js';
import '../styles/Home.css';

export default function Home({title,text='Manage your herbs, spices, original blends, and orders.',alt='Herbs & Spices'}){
 const {business,tagline}=usePublicBusiness(getRuntimeAppKey());
 return <section className="home-hero">{hero&&<img src={hero} alt={alt} className="home-hero-image"/>}<div className="home-hero-overlay"><div className="home-hero-content"><h1 className="home-hero-title">{business?.legalName||title||'Herbs & Spices'}</h1><p className="home-hero-text">{tagline||text}</p><Link to="/dashboard" className="home-hero-button">Go to Dashboard</Link></div></div></section>;
}
