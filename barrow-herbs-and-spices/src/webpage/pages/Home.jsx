import { Link } from 'react-router-dom';
import { useShop } from "../ShopContext.jsx";
import { ProductCards } from "../Commerce.jsx";
import { Availability } from "../Commerce.jsx";
export default function Home() {
  const {
    products
  } = useShop();
  return <><section className="hero"><div className="hero-copy"><p className="eyebrow">THE HERBS & SPICES COLLECTION</p><h1>Make it<br /><em>your kind</em><br />of flavorful.</h1><p>Original spice blends, created to bring a little more character to your cooking.</p><Link className="solid-link" to="/shop">Find your next blend <span>↗</span></Link></div><div className="hero-index"><div className="giant-amp" aria-hidden="true">&</div><p>HERBS<br /><em>meet</em><br />SPICES</p><span className="hero-footnote">A PINCH. A SPOONFUL. A NEW POSSIBILITY.</span></div></section><div className="flavor-strip"><span>FROM YOUR SPICE CUPBOARD</span><span>TO SOMETHING MEMORABLE</span><span>LET’S COOK ↘</span></div><section className="collection"><div className="section-heading"><div><p className="eyebrow">EXPLORE THE COLLECTION</p><h2>Small jars.<br />Plenty of possibility.</h2></div><Link to="/shop">All blends ↗</Link></div><Availability>{products.length ? <ProductCards rows={products.slice(0, 3)} /> : <div className="coming-soon"><h3>The spice cabinet is being prepared.</h3><p>Our blends will appear here as they become available.</p><Link to="/contact">Get in touch ↗</Link></div>}</Availability></section><section className="editorial"><span className="chapter">01 / THE IDEA</span><h2>Good flavor<br />starts with<br /><em>a little curiosity.</em></h2><div><p>Try a different seasoning. Revisit a favorite dish. Find a blend that feels like you.</p><Link to="/about">Meet the collection ↗</Link></div></section></>;
}
