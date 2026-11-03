import { Form } from "react-bootstrap";
import { useState } from 'react';
import { money } from "../../utils/api.js";
import { emptyBlend, blendCost } from '../../utils/records.js';
export default function BlendForm({
  initialData,
  ingredients,
  onSubmit,
  onCancel,
  busy
}) {
  const [blend, setBlend] = useState(() => initialData || emptyBlend());
  const changeBlend = (key, value) => setBlend({
    ...blend,
    [key]: value
  });
  const recipeCost = row => blendCost(row, ingredients);
  const submit = event => {
    event.preventDefault();
    onSubmit(blend);
  };
  return <form className="editor" onSubmit={submit}><h2>{blend._id ? 'Edit blend' : 'Create your blend'}</h2><div className="form-grid">{[['name', 'Blend name'], ['sku', 'SKU'], ['category', 'Category'], ['heat', 'Heat level'], ['packGrams', 'Pack weight (g)', 'number'], ['packagingCost', 'Packaging cost / pack ($)', 'number'], ['price', 'Selling price / pack ($)', 'number'], ['image', 'Product image URL', 'url']].map(([key, label, type]) => <Form.Group key={key}><Form.Label>{label}</Form.Label><Form.Control type={type} value={blend[key] ?? ""} required={['name', 'packGrams', 'price', 'packagingCost'].includes(key)} {...type === 'number' ? {
          min: key === 'packGrams' ? 1 : 0,
          step: 'any'
        } : {}} onChange={event => (value => changeBlend(key, value))(event.target.value)} /></Form.Group>)}</div><label>Description<textarea value={blend.description} onChange={e => changeBlend('description', e.target.value)} maxLength={2000} /></label><div className="form-grid">{[['uses', 'Suggested uses'], ['storage', 'Storage instructions'], ['allergens', 'Allergen information']].map(([key, label]) => <Form.Group key={key}><Form.Label>{label}</Form.Label><Form.Control value={blend[key] ?? ""} onChange={event => (value => changeBlend(key, value))(event.target.value)} /></Form.Group>)}</div><h3>Recipe formula</h3><p>Percentages stay private. Ingredient names appear on the public product page.</p>{blend.formula.map((part, index) => <div className="formula-row" key={index}><label>Ingredient<select required value={part.ingredientId} onChange={e => {
          const ingredient = ingredients.find(row => row._id === e.target.value);
          changeBlend('formula', blend.formula.map((row, i) => i === index ? {
            ...row,
            ingredientId: ingredient?._id || '',
            kind: ingredient?.kind || 'spices'
          } : row));
        }}><option value="">Choose ingredient</option>{ingredients.map(row => <option key={row._id} value={row._id}>{row.name} ({row.kind})</option>)}</select></label><Form.Group><Form.Label>{"Percent (%)"}</Form.Label><Form.Control type="number" min="0.001" max="100" step="any" value={part.percent ?? ""} required onChange={event => (value => changeBlend('formula', blend.formula.map((row, i) => i === index ? {
          ...row,
          percent: value
        } : row)))(event.target.value)} /></Form.Group><button type="button" aria-label={`Remove ingredient ${index + 1}`} onClick={() => changeBlend('formula', blend.formula.filter((_, i) => i !== index))}>Remove</button></div>)}<button type="button" onClick={() => changeBlend('formula', [...blend.formula, {
      kind: 'spices',
      ingredientId: '',
      percent: 0
    }])}>Add ingredient</button><p className="recipe-total">Total: {blend.formula.reduce((sum, row) => sum + Number(row.percent || 0), 0).toFixed(3)}% · Cost / pack: {money(recipeCost(blend))} · Gross margin: {blend.price > 0 ? ((blend.price - recipeCost(blend)) / blend.price * 100).toFixed(1) + '%' : '—'}</p><small>Cost includes ingredients and packaging. Labor, tax, shipping, and overhead are excluded.</small><label className="check"><input type="checkbox" checked={blend.published} onChange={e => changeBlend('published', e.target.checked)} />Publish in storefront</label><div className="actions"><button className="primary" disabled={busy}>Save blend</button><button type="button" onClick={onCancel}>Cancel</button></div></form>;
}
