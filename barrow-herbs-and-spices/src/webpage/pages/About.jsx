import { Link } from 'react-router-dom';
export default function About() {
  return <section className="page story"><p className="eyebrow">OUR BLENDS</p><h1>Built around<br /><em>good flavor.</em></h1><div className="story-grid"><p className="large-copy">Herbs & Spices is a place for original blends and the meals they make possible.</p><div><h2>A recipe of our own.</h2><p>We create our own spice blends. Browse the collection to find the ingredients, heat level, suggested uses, and pack size for each one.</p><h2>Choose something that suits you.</h2><p>Check each blend’s ingredient and allergen information before ordering. If you have a question, get in touch before choosing your blend.</p><Link className="solid-link" to="/shop">Explore the blends ↗</Link></div></div></section>;
}
