import {Form,Button} from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

export default function EmergencyContactsForm({contacts=[],countryCode="us",onChange,onPhoneChange,onAdd,onRemove})
{
 return(
  <div className="admin-user-emergency-contacts">
   {contacts.length?contacts.map((contact,index)=>(
    <div className="admin-user-emergency-contact-row" key={contact._id||index}>
     <Form.Group className="form-inline-field is-contact-name">
      <Form.Label>Contact Name</Form.Label>
      <Form.Control type="text" value={contact.name||""} onChange={event=>onChange(index,"name",event.target.value)} required/>
      <Form.Control.Feedback type="invalid">Contact name is required.</Form.Control.Feedback>
     </Form.Group>

     <Form.Group className="form-inline-field is-contact-phone">
      <Form.Label>Phone</Form.Label>
      <div className="admin-user-phone-control">
       <PhoneInput country={countryCode} value={contact.phone||""} onChange={value=>onPhoneChange(index,value)} inputProps={{name:`emergencyContactPhone${index}`}} containerClass="admin-user-phone-input"/>
      </div>
     </Form.Group>

     <Form.Group className="form-inline-field is-contact-relationship">
      <Form.Label>Relationship</Form.Label>
      <Form.Control type="text" value={contact.relationship||""} onChange={event=>onChange(index,"relationship",event.target.value)}/>
     </Form.Group>

     <Button type="button" variant="outline-danger" onClick={()=>onRemove(index)}>Remove</Button>
    </div>
   )):<p className="admin-user-empty">No emergency contacts added.</p>}

   <Button type="button" variant="outline-primary" onClick={onAdd}>Add Emergency Contact</Button>
  </div>
 );
}
