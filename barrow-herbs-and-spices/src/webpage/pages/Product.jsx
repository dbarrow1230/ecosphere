import { Link, useParams } from 'react-router-dom';
import { useShop } from "../ShopContext.jsx";
import { money } from "../../utils/api.js";
import { ProductImage } from "../Commerce.jsx";
import { Availability } from "../Commerce.jsx";
export default function Product() {
  const {
      id
    } = useParams(),
    {
      products,
      add
    } = useShop(),
    row = products.find(item => item.id === id);
  return <section className="page"><Link to="/shop">← All blends</Link><Availability>{row ? <div className="detail-grid"><div className="detail-art"><ProductImage product={row} /></div><div><p className="eyebrow">{row.category || 'ORIGINAL BLEND'}</p><h1>{row.name}</h1><p className="detail-price">{money(row.price)} <small>/ {row.packGrams} g</small></p><p>{row.description}</p><p>Heat: {row.heat}</p><button className="solid-link" disabled={!row.stock} onClick={() => add(row)}>{row.stock ? 'Add to basket +' : 'Currently sold out'}</button><dl><dt>Ingredients</dt><dd>{row.ingredients}</dd><dt>Allergen information</dt><dd>{row.allergens || 'Ask us about allergens before ordering if you have a food allergy.'}</dd>{row.uses && <><dt>Try it with</dt><dd>{row.uses}</dd></>}{row.storage && <><dt>Storage</dt><dd>{row.storage}</dd></>}</dl><p className="fine-print">Orders are confirmed personally. Final price, fulfillment, and payment are arranged after your request.</p></div></div> : <><h1>Blend unavailable</h1><Link to="/shop">Return to the collection</Link></>}</Availability></section>;
}
