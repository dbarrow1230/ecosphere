import { Form } from "react-bootstrap";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money, uid } from "../utils/api.js";
import { useStudio } from "../utils/studioContext.jsx";
import { blendCost } from '../utils/records.js';
export default function ProductionPage() {
  const {
      data,
      run,
      busy
    } = useStudio(),
    products = data.blends,
    ingredients = data.ingredients;
  const [batch, setBatch] = useState({
    blendId: '',
    units: 1,
    lot: '',
    notes: '',
    operationId: uid()
  });
  const selected = products.find(row => row._id === batch.blendId),
    recipeCost = row => blendCost(row, ingredients);
  return <><header className="page-heading"><h1>Blend Production</h1><Link to="/batches">Batch History</Link></header><form className="editor" onSubmit={e => {
      e.preventDefault();
      run(async () => {
        const result = await api('/api/studio/production', batch);
        setBatch({
          ...batch,
          lot: '',
          notes: '',
          operationId: uid()
        });
        return result.message;
      });
    }}><h2>Make a batch</h2><p>Production deducts ingredient weights and adds finished packs in one inventory update.</p><div className="form-grid"><label>Blend<select value={batch.blendId} required onChange={e => setBatch({
            ...batch,
            blendId: e.target.value
          })}><option value="">Choose blend</option>{products.map(row => <option value={row._id} key={row._id}>{row.name}</option>)}</select></label><Form.Group><Form.Label>{"Number of packs"}</Form.Label><Form.Control type="number" min={1} step={1} value={batch.units ?? ""} required onChange={event => (units => setBatch({
            ...batch,
            units
          }))(event.target.value)} /></Form.Group><Form.Group><Form.Label>{"Lot / batch reference"}</Form.Label><Form.Control value={batch.lot ?? ""} required onChange={event => (lot => setBatch({
            ...batch,
            lot
          }))(event.target.value)} /></Form.Group></div>{selected && <div className="batch-preview"><h3>{(selected.packGrams * batch.units).toLocaleString()} g total · Estimated cost {money(recipeCost(selected) * batch.units)}</h3>{selected.formula.map(row => {
          const ingredient = ingredients.find(item => item._id === row.ingredientId);
          return <p key={row.ingredientId}>{ingredient?.name || 'Unavailable ingredient'} <strong>{(selected.packGrams * batch.units * row.percent / 100).toLocaleString()} g</strong> <small>({ingredient?.stockGrams || 0} g in stock)</small></p>;
        })}</div>}<label>Batch notes<textarea value={batch.notes} maxLength={2000} onChange={e => setBatch({
          ...batch,
          notes: e.target.value
        })} /></label><button className="primary" disabled={busy}>Record production</button></form></>;
}
