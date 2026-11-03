import {Link} from 'react-router-dom';
import {useShop} from './ShopContext.jsx';
import {money} from '../utils/api.js';
export function ProductCards({
  rows
}) {
  const {
    add
  } = useShop();
  return <div className="product-grid">{rows.map((row, index) => <article className="product-card" key={row.id}><Link className="product-art" to={`/shop/${row.id}`}><span className="edition">BLEND / {String(index + 1).padStart(2, '0')}</span><ProductImage product={row} /></Link><div className="product-caption"><div><p className="eyebrow">{row.category || 'ORIGINAL BLEND'} · {row.packGrams} G</p><h3><Link to={`/shop/${row.id}`}>{row.name}</Link></h3></div><span>{money(row.price)}</span></div><p>{row.description}</p><button disabled={row.stock < 1} onClick={() => add(row)}>{row.stock > 0 ? 'Add to basket +' : 'Currently sold out'}</button></article>)}</div>;
}
export function ProductImage({
  product
}) {
  return product.image ? <img className="product-image" src={product.image} alt={product.name} loading="lazy" referrerPolicy="no-referrer" /> : <div className="type-art" aria-hidden="true"><span>{product.name}</span><i>{product.packGrams} g</i></div>;
}
export function Availability({
  children
}) {
  const {
    loading,
    error,
    load
  } = useShop();
  return loading ? <p role="status">Opening the spice cabinet…</p> : error ? <div role="alert"><p>{error}</p><button onClick={load}>Try again</button></div> : children;
}
