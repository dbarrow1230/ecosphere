import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { assetUrl } from '../../../shared/public/usePublicBusiness.js';
import { useShop } from "./ShopContext.jsx";
export default function SiteShell({
  children
}) {
  const {
    brand,
    name,
    count,
    notice
  } = useShop();
  const {
    pathname
  } = useLocation();
  useEffect(() => {
    document.title = ({
      '/': 'Original Spice Blends',
      '/shop': 'Shop Blends',
      '/about': 'Our Blends',
      '/contact': 'Contact',
      '/faq': 'Questions',
      '/basket': 'Your Basket'
    }[pathname] || 'Spice Blend') + ' | ' + name;
    window.scrollTo(0, 0);
  }, [pathname, name]);
  return <div className="spice-site" style={brand.style}><a className="skip" href="#main">Skip to content</a><div className="masthead-note">{brand.tagline || 'ORIGINAL BLENDS · YOUR NEXT GOOD MEAL'}</div><header className="masthead"><Link className="wordmark" to="/">{brand.business?.logo && <img src={assetUrl(brand.business.logo)} alt="" />}<span>{name}<small>THE SPICE COLLECTION</small></span></Link><nav aria-label="Main navigation"><NavLink to="/shop">Shop blends</NavLink><NavLink to="/about">Our blends</NavLink><NavLink to="/contact">Contact</NavLink></nav><Link className="basket-link" to="/basket">Basket <span>{count}</span></Link></header><main id="main" tabIndex={-1}>{children}</main><p className="basket-notice" role="status">{notice}</p><footer><div><Link className="footer-name" to="/">{name}</Link><p>A blend for the way you cook.</p></div><nav aria-label="Footer"><Link to="/shop">Shop</Link><Link to="/about">Our blends</Link><Link to="/faq">Questions</Link><Link to="/contact">Contact</Link></nav><small>© {new Date().getFullYear()} {name}</small></footer></div>;
}
