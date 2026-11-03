import { useState } from 'react';
import { useShop } from "../ShopContext.jsx";
import { ProductCards } from "../Commerce.jsx";
import { Availability } from "../Commerce.jsx";
export default function Shop() {
  const {
      products
    } = useShop(),
    [search, setSearch] = useState(''),
    [category, setCategory] = useState('All');
  const rows = products.filter(row => (category === 'All' || row.category === category) && `${row.name} ${row.description} ${row.uses}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="page"><p className="eyebrow">THE SPICE CABINET</p><h1>Find your flavor.</h1><p>Explore the blends, check the ingredients, and make something delicious.</p><div className="shop-tools"><label>Search blends<input type="search" placeholder="A name, a flavor, a dish…" value={search} onChange={e => setSearch(e.target.value)} /></label><label>Category<select value={category} onChange={e => setCategory(e.target.value)}>{['All', ...new Set(products.map(row => row.category).filter(Boolean))].map(value => <option key={value}>{value}</option>)}</select></label></div><Availability>{rows.length ? <><p className="result-count">{rows.length} {rows.length === 1 ? 'blend' : 'blends'}</p><ProductCards rows={rows} /></> : <div className="coming-soon"><h2>{products.length ? 'No matching blends.' : 'New blends are on the way.'}</h2><p>{products.length ? 'Try another search or category.' : 'The collection will appear here when it is ready.'}</p></div>}</Availability></section>;
}
