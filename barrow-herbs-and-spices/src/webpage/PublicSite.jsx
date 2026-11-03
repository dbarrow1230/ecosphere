import { Routes, Route } from 'react-router-dom';
import { ShopProvider } from "./ShopContext.jsx";
import SiteShell from './SiteShell.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import FAQ from './pages/FAQ.jsx';
import Basket from './pages/Basket.jsx';
import NotFound from './pages/NotFound.jsx';
export default function PublicSite() {
  return <ShopProvider><SiteShell><Routes><Route path="/" element={<Home />} /><Route path="/shop" element={<Shop />} /><Route path="/shop/:id" element={<Product />} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="/faq" element={<FAQ />} /><Route path="/basket" element={<Basket />} /><Route path="*" element={<NotFound />} /></Routes></SiteShell></ShopProvider>;
}
