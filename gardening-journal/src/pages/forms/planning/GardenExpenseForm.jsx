import {useState} from "react";
import {Alert,Button,Col,Form,Row} from "react-bootstrap";

const defaults={"name": "", "purchaseDate": "", "vendor": "", "warranty": "", "quantity": 1, "unitCost": "", "savedAmount": "", "currency": "USD", "notes": ""};

export default function GardenExpenseForm({record,onSave,onCancel,saving,error}){
 const [form,setForm]=useState(()=>({
 name:record?.name??defaults.name,
 purchaseDate:record?.purchaseDate?.slice(0,10)||"",
 vendor:record?.vendor??defaults.vendor,
 warranty:record?.warranty??defaults.warranty,
 quantity:record?.quantity??defaults.quantity,
 unitCost:record?.unitCost??defaults.unitCost,
 savedAmount:record?.savedAmount??defaults.savedAmount,
 currency:record?.currency??defaults.currency,
 notes:record?.notes??defaults.notes,
 }));
 const change=(key,value)=>setForm(previous=>({...previous,[key]:value}));
 const submit=event=>{event.preventDefault();onSave(form);};
 return <Form onSubmit={submit}>
  {error&&<Alert variant="danger">{error}</Alert>}
  <Row className="g-3">
    <Col md={6}><Form.Group controlId="garden-expenses-name"><Form.Label>Item</Form.Label><Form.Control type="text" value={form.name} onChange={event=>change("name",event.target.value)} required/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-expenses-purchaseDate"><Form.Label>Purchase date</Form.Label><Form.Control type="date" value={form.purchaseDate} onChange={event=>change("purchaseDate",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-expenses-vendor"><Form.Label>Vendor</Form.Label><Form.Control type="text" value={form.vendor} onChange={event=>change("vendor",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-expenses-warranty"><Form.Label>Warranty</Form.Label><Form.Control type="text" value={form.warranty} onChange={event=>change("warranty",event.target.value)}/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-expenses-quantity"><Form.Label>Quantity</Form.Label><Form.Control type="number" value={form.quantity} onChange={event=>change("quantity",event.target.value)} min="0" step="any"/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-expenses-unitCost"><Form.Label>Price per item</Form.Label><Form.Control type="number" value={form.unitCost} onChange={event=>change("unitCost",event.target.value)} min="0" step="any"/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-expenses-savedAmount"><Form.Label>Amount saved</Form.Label><Form.Control type="number" value={form.savedAmount} onChange={event=>change("savedAmount",event.target.value)} min="0" step="any"/></Form.Group></Col>
    <Col md={6}><Form.Group controlId="garden-expenses-currency"><Form.Label>Currency</Form.Label><Form.Control type="text" value={form.currency} onChange={event=>change("currency",event.target.value)}/></Form.Group></Col>
    <Col md={12}><Form.Group controlId="garden-expenses-notes"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={3} value={form.notes} onChange={event=>change("notes",event.target.value)}/></Form.Group></Col>
  </Row>
  <p className="mt-3 fw-bold">Amount paid: {((Number(form.quantity)||0)*(Number(form.unitCost)||0)-(Number(form.savedAmount)||0)).toFixed(2)} {form.currency}</p>
  <div className="d-flex gap-2 mt-3"><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Expense"}</Button><Button type="button" variant="outline-secondary" onClick={onCancel} disabled={saving}>Cancel</Button></div>
 </Form>;
}
