import {Link} from 'react-router-dom';
import {ArrowRight,Leaf,Utensils,BookOpen} from 'lucide-react';
import {usePublicSite} from '../../../../shared/public/PublicSiteContext.jsx';
import {BlogFeed} from '../Blog.jsx';
export default function Home(){const {site}=usePublicSite();return <>
 <section className="pw-wrap cx-gourmet-masthead"><p className="pw-eyebrow">A blog by Darrell Barrow-Pender</p><h1>Cook with curiosity.<br/>Preserve what matters.</h1><p>Bajan and Caribbean food, garden discoveries, family recipes, practical sustainability, and the questions that lead somewhere useful.</p><nav aria-label="Explore the blog"><Link to="/blog">Latest stories</Link><Link to="/about">The story behind the blog</Link><Link to="/conversations">Share a question</Link></nav></section>
 <BlogFeed home/>
 <section className="gourmet-reading-index"><header><p className="pw-eyebrow">The things that connect</p><h2>Kitchen, garden,<br/>and the everyday.</h2></header><div><Link to="/contact?topic=A%20food%20memory"><Utensils size={22}/><span>Food & memory</span><ArrowRight size={18}/></Link><Link to="/contact?topic=Growing%20and%20preserving"><Leaf size={22}/><span>Growing & preserving</span><ArrowRight size={18}/></Link><Link to="/contact?topic=A%20question%20to%20explore"><BookOpen size={22}/><span>A question worth exploring</span><ArrowRight size={18}/></Link></div></section>
 <section className="gourmet-writer-note"><img src={site.hero} alt={site.heroAlt}/><div><p className="pw-eyebrow">Meet the writer</p><h2>Food, memory, and the urge to understand.</h2><p>Darrell brings his Bajan background, culinary learning, gardening, technology, and practical experimentation to the page.</p><Link to="/about">Darrell’s story<ArrowRight size={18}/></Link></div></section>
 </>;}
