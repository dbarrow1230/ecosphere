import {useState} from "react";
import {Alert,Button,Col,Form,Row} from "react-bootstrap";

const defaults={"name": "", "description": "", "year": "", "quantity": 1, "unitCost": "", "allottedBudget": "", "currency": "USD"};

export default function GardenBudgetForm({record,onSave,onCancel,saving,error}){
 const [form,setForm]=useState(()=>({
 name:record?.name??defaults.name,
 description:record?.description??defaults.description,
 year:record?.year??defaults.year,
 quantity:record?.quantity??defaults.quantity,
 unitCost:record?.unitCost??defaults.unitCost,
 allottedBudget:record?.allottedBudget??defaults.allottedBudget,
 currency:record?.currency??defaults.currency,
 }));
 const change=(key,value)=>setForm(previous=>({...previous,[key]:value}));
 const submit=event=>{event.preventDefault();onSave(form);};
 return <Form onSubmit={submit}>
  {error&&<Alert variant="danger">{error}</Alert>}
  <Row className="g-3">
    <Col md={6}><Form.Group controlId="garden-budgets-name"><Form.Label>Item</Form.Label><Form.Control type="text" value={form.name} onChange={event=>change("name",event.target.value)} required/></Form.Group></Col>
    <Col md={12}><Form.Group controlId="garden-budgets-description"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={form.description} onChange={event=>change("description",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-budgets-year"><Form.Label>Budget year</Form.Label><Form.Control type="number" value={form.year} onChange={event=>change("year",event.target.value)} min="0" step="1"/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-budgets-quantity"><Form.Label>Quantity</Form.Label><Form.Control type="number" value={form.quantity} onChange={event=>change("quantity",event.target.value)} min="0" step="any"/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-budgets-unitCost"><Form.Label>Cost per item</Form.Label><Form.Control type="number" value={form.unitCost} onChange={event=>change("unitCost",event.target.value)} min="0" step="any"/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-budgets-allottedBudget"><Form.Label>Allotted budget</Form.Label><Form.Control type="number" value={form.allottedBudget} onChange={event=>change("allottedBudget",event.target.value)} min="0" step="any"/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-budgets-currency"><Form.Label>Currency</Form.Label><Form.Control type="text" value={form.currency} onChange={event=>change("currency",event.target.value)}/></Form.Group></Col>
  </Row>
  <p className="mt-3 fw-bold">Estimated total: {((Number(form.quantity)||0)*(Number(form.unitCost)||0)).toFixed(2)} {form.currency}</p>
  <div className="d-flex gap-2 mt-3"><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Budget Item"}</Button><Button type="button" variant="outline-secondary" onClick={onCancel} disabled={saving}>Cancel</Button></div>
 </Form>;
}
