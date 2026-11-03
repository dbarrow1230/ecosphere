import { Form } from "react-bootstrap";
import { useState } from 'react';
import { api, uid } from "../../../utils/api.js";
import { useStudio } from "../../../utils/studioContext.jsx";
export default function StockPage() {
  const {
      data,
      run,
      busy
    } = useStudio(),
    ingredients = data.ingredients;
  const [stock, setStock] = useState({
    id: '',
    kind: 'spices',
    grams: 1000,
    direction: 'add',
    note: '',
    operationId: uid()
  });
  return <><h1>Ingredient Stock</h1><form className="editor" onSubmit={e => {
      e.preventDefault();
      run(async () => {
        await api('/api/studio/stock', stock);
        setStock({
          ...stock,
          note: '',
          operationId: uid()
        });
        return 'Ingredient stock adjusted.';
      });
    }}><h2>Receive or adjust ingredient stock</h2><div className="form-grid"><label>Ingredient<select required value={stock.id} onChange={e => {
            const row = ingredients.find(item => item._id === e.target.value);
            setStock({
              ...stock,
              id: row?._id || '',
              kind: row?.kind || 'spices'
            });
          }}><option value="">Choose ingredient</option>{ingredients.map(row => <option key={row._id} value={row._id}>{row.name}</option>)}</select></label><label>Adjustment<select value={stock.direction} onChange={e => setStock({
            ...stock,
            direction: e.target.value
          })}><option value="add">Receive / add</option><option value="remove">Remove / waste</option></select></label><Form.Group><Form.Label>{"Weight (g)"}</Form.Label><Form.Control type="number" min="0.001" step="any" required value={stock.grams ?? ""} onChange={event => (grams => setStock({
            ...stock,
            grams
          }))(event.target.value)} /></Form.Group><Form.Group><Form.Label>{"Reason / supplier reference"}</Form.Label><Form.Control required maxLength={300} value={stock.note ?? ""} onChange={event => (note => setStock({
            ...stock,
            note
          }))(event.target.value)} /></Form.Group></div><button className="primary" disabled={busy}>Record adjustment</button></form></>;
}
