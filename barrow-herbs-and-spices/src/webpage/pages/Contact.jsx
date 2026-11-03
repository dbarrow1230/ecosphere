import { Link } from 'react-router-dom';
import { useShop } from "../ShopContext.jsx";
export default function Contact() {
  const {
      brand
    } = useShop(),
    b = brand.business;
  return <section className="page story"><p className="eyebrow">LET’S TALK FLAVOR</p><h1>A question?<br /><em>Get in touch.</em></h1><div className="story-grid"><p className="large-copy">Ask about a blend, an ingredient, or your next order.</p><div>{b?.email && <p><a href={`mailto:${b.email}`}>{b.email}</a></p>}{b?.phone && <p><a href={`tel:${b.phone}`}>{b.phone}</a></p>}{b?.addressLine1 && <p>{b.addressLine1}<br />{b.addressLine2}</p>}{!b?.email && !b?.phone && <p>Direct contact details will be available here when they are published.</p>}<h2>Ready to order?</h2><p>Choose your blends and send an order request from your basket. Include any questions or fulfillment preferences in the order notes. We’ll use the email address you provide to follow up.</p><Link className="solid-link" to="/shop">Browse the collection ↗</Link><p><Link to="/faq">Ordering questions ↗</Link></p></div></div></section>;
}
