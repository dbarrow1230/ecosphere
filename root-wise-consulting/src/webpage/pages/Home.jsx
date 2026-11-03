import {Link} from "react-router-dom";
import {ArrowDown,ArrowUpRight,MoveRight} from "lucide-react";
import {useRootWise} from "../RootWiseShell.jsx";
import ConsultingBrief from "../components/ConsultingBrief.jsx";

export default function Home(){const {hero,name}=useRootWise();return <>
 <section className="rw-cover"><img src={hero} alt="Menu planning and kitchen ingredients at Root Wise"/><div className="rw-cover-shade"/><div className="rw-cover-top"><span>Culinary consulting</span><Link to="/contact">Start a conversation<ArrowUpRight size={18}/></Link></div><div className="rw-cover-copy"><p className="rw-kicker">From the menu to the pass</p><h1>Menu.<br/>Kitchen.<br/><em>Service.</em></h1><p>Look at how the whole operation works—then decide what needs to change.</p><a className="rw-cover-explore" href="#consulting-brief"><ArrowDown size={20}/> Find your starting point</a></div><div className="rw-cover-caption"><span>{name}</span><span>Food-service operations · Menu review · Opening support</span></div></section>
 <ConsultingBrief/>
 <section className="rw-fieldnote"><div><p className="rw-kicker">The work behind the food</p><h2>A menu is only<br/>part of the picture.</h2></div><div><p>What can your team prepare consistently? Where does prep back up? How are purchasing and waste affecting the work?</p><p>Root Wise brings those questions into the same conversation, with assessments, recommendations, and a defined plan for the next steps.</p><Link className="rw-text-link" to="/approach">See how we work<MoveRight size={24}/></Link></div></section>
 </>;}
