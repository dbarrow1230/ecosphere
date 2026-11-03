import { Form } from "react-bootstrap";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { money } from "../../utils/api.js";
import { useStudio } from "../../utils/studioContext.jsx";
import { blendCost } from "../../utils/records.js";
export default function BlendPage() {
  const {
      data,
      archive
    } = useStudio(),
    navigate = useNavigate(),
    [search, setSearch] = useState(''),
    products = data.blends,
    ingredients = data.ingredients;
  const recipeCost = row => blendCost(row, ingredients);
  const filtered = rows => rows.filter(row => (row.name + ' ' + (row.sku || '') + ' ' + (row.category || '')).toLowerCase().includes(search.toLowerCase()));
  return <><header className="page-heading"><h1>Spice Blends</h1><Link className="btn btn-primary" to="/blends/new">Add Blend</Link></header><div className="tools"><Form.Group><Form.Label>{"Search blends"}</Form.Label><Form.Control value={search ?? ""} onChange={event => setSearch(event.target.value)} /></Form.Group></div><div className="table-wrap"><table><thead><tr><th>Blend / SKU</th><th>Pack</th><th>Cost</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{filtered(products).map(row => <tr key={row._id}><td><strong>{row.name}</strong><small>{row.sku}</small></td><td>{row.packGrams} g</td><td>{money(recipeCost(row))}</td><td>{money(row.price)}</td><td>{row.stock}</td><td>{row.published ? 'Published' : 'Draft'}</td><td><button onClick={() => navigate('/blends/' + row._id + '/edit')}>Edit</button><button onClick={() => archive(`/api/studio/blends/${row._id}`, row.name)}>Archive</button></td></tr>)}</tbody></table>{!filtered(products).length && <p className="empty">No blends found. Create a blend using your own recipe.</p>}</div></>;
}
