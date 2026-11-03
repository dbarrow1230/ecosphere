import { Form } from "react-bootstrap";
import { useState } from 'react';
import { emptyResource, resourceLabels as labels } from "../../../utils/records.js";
export default function ResourceForm({
  initialData,
  kind,
  onSubmit,
  onCancel,
  busy
}) {
  const [resource, setResource] = useState(() => initialData || emptyResource());
  const submit = event => {
    event.preventDefault();
    onSubmit(resource);
  };
  return <form className="editor" onSubmit={submit}><h2>{resource._id ? 'Edit' : 'New'} {labels[kind].toLowerCase()}</h2><div className="form-grid"><Form.Group><Form.Label>{"Name"}</Form.Label><Form.Control value={resource.name ?? ""} required maxLength={120} onChange={event => (name => setResource({
          ...resource,
          name
        }))(event.target.value)} /></Form.Group>{(kind === 'equipment' ? [['equipment_id', 'Equipment ID'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel']] : ['herbs', 'spices'].includes(kind) ? [['costPerKg', 'Cost per kg ($)', 'number'], ['botanicalName', 'Botanical name'], ['vendor', 'Vendor'], ['allergens', 'Allergens']] : [['email', 'Email', 'email'], ['phone', 'Phone', 'tel']]).concat([['category', 'Category'], ['type', 'Type']]).map(([key, label, type]) => <Form.Group key={key}><Form.Label>{label}</Form.Label><Form.Control type={type} required={key === "equipment_id" || kind === "vendors" && key === "email"} value={resource[key] ?? ""} {...type === 'number' ? {
          min: 0,
          step: 'any',
          required: true
        } : {}} onChange={event => (value => setResource({
          ...resource,
          [key]: value
        }))(event.target.value)} /></Form.Group>)}</div><label>Private notes<textarea value={resource.notes} onChange={e => setResource({
        ...resource,
        notes: e.target.value
      })} maxLength={2000} /></label><div className="actions"><button className="primary" disabled={busy}>Save record</button><button type="button" onClick={onCancel}>Cancel</button></div></form>;
}
