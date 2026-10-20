import {useState} from "react";
import {Alert,Button,Col,Form,Row} from "react-bootstrap";

const defaults={"name": "", "description": "", "quantity": 1, "vendor": "", "unitCost": "", "warranty": "", "currency": "USD", "purchased": false};

export default function GardenWishForm({record,onSave,onCancel,saving,error}){
 const [form,setForm]=useState(()=>({
 name:record?.name??defaults.name,
 description:record?.description??defaults.description,
 quantity:record?.quantity??defaults.quantity,
 vendor:record?.vendor??defaults.vendor,
 unitCost:record?.unitCost??defaults.unitCost,
 warranty:record?.warranty??defaults.warranty,
 currency:record?.currency??defaults.currency,
 purchased:record?.purchased??defaults.purchased,
 }));
 const change=(key,value)=>setForm(previous=>({...previous,[key]:value}));
 const submit=event=>{event.preventDefault();onSave(form);};
 return <Form onSubmit={submit}>
  {error&&<Alert variant="danger">{error}</Alert>}
  <Row className="g-3">
    <Col md={6}><Form.Group controlId="garden-wishlist-name"><Form.Label>Item</Form.Label><Form.Control type="text" value={form.name} onChange={event=>change("name",event.target.value)} required/></Form.Group></Col>
    <Col md={12}><Form.Group controlId="garden-wishlist-description"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={form.description} onChange={event=>change("description",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-wishlist-quantity"><Form.Label>Quantity</Form.Label><Form.Control type="number" value={form.quantity} onChange={event=>change("quantity",event.target.value)} min="0" step="any"/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-wishlist-vendor"><Form.Label>Place to buy</Form.Label><Form.Control type="text" value={form.vendor} onChange={event=>change("vendor",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-wishlist-unitCost"><Form.Label>Price per item</Form.Label><Form.Control type="number" value={form.unitCost} onChange={event=>change("unitCost",event.target.value)} min="0" step="any"/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-wishlist-warranty"><Form.Label>Warranty</Form.Label><Form.Control type="text" value={form.warranty} onChange={event=>change("warranty",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-wishlist-currency"><Form.Label>Currency</Form.Label><Form.Control type="text" value={form.currency} onChange={event=>change("currency",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Check id="garden-wishlist-purchased" label="Purchased" checked={form.purchased} onChange={event=>setForm(previous=>({...previous,purchased:event.target.checked}))}/></Col>
  </Row>
  <p className="mt-3 fw-bold">Estimated total: {((Number(form.quantity)||0)*(Number(form.unitCost)||0)).toFixed(2)} {form.currency}</p>
  <div className="d-flex gap-2 mt-3"><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Wish List Item"}</Button><Button type="button" variant="outline-secondary" onClick={onCancel} disabled={saving}>Cancel</Button></div>
 </Form>;
}
