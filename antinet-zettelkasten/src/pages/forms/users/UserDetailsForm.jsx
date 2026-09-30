import {Form,Button,Row,Col,Alert} from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

export default function UserDetailsForm({
 details,
 states=[],
 counties=[],
 countries=[],
 onChange,
 onPhoneChange,
 onCellChange,
 onNoteChange,
 onAddNote,
 onRemoveNote,
 onAvatarFileChange,
 onAvatarClear,
 avatarFile,
 avatarPreview,
 avatarUploading,
 avatarError,
 avatarInputKey
})
{
 const getId=value=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  return value._id||value.id||value.$oid||value._id?.$oid||"";
 };

 const selectedCountry=countries.find(country=>getId(country)===getId(details.country));
 const isUnitedStates=String(selectedCountry?.iso2||"").toUpperCase()==="US";
 const phoneCountry=String(selectedCountry?.iso2||"US").toLowerCase();
 const availableCounties=isUnitedStates&&details.state?counties.filter(county=>{
  return getId(county.country)===getId(details.country)&&
   getId(county.state)===getId(details.state)&&
   county.isActive!==false;
 }):[];

 return(
  <>
   <Row className="mb-3">
    <Col md={6}>
     <Form.Group className="form-inline-field">
      <Form.Label>First Name</Form.Label>
      <Form.Control type="text" name="firstName" value={details.firstName} onChange={onChange}/>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group className="form-inline-field">
      <Form.Label>Last Name</Form.Label>
      <Form.Control type="text" name="lastName" value={details.lastName} onChange={onChange}/>
     </Form.Group>
    </Col>
   </Row>

   <Row className="mb-3">
    <Col md={6}>
     <Form.Group className="form-inline-field">
      <Form.Label>Phone</Form.Label>
      <div className="admin-user-phone-control">
       <PhoneInput country={phoneCountry} value={details.phone} onChange={onPhoneChange} inputProps={{name:"phone"}} containerClass="admin-user-phone-input"/>
      </div>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group className="form-inline-field">
      <Form.Label>Cell</Form.Label>
      <div className="admin-user-phone-control">
       <PhoneInput country={phoneCountry} value={details.cell} onChange={onCellChange} inputProps={{name:"cell"}} containerClass="admin-user-phone-input"/>
      </div>
     </Form.Group>
    </Col>
   </Row>

   <Row className="mb-3">
    <Col md={12}>
     <Form.Group className="form-inline-field">
      <Form.Label>Address 1</Form.Label>
      <Form.Control type="text" name="address1" value={details.address1} onChange={onChange}/>
     </Form.Group>
    </Col>
   </Row>

   <Row className="mb-3">
    <Col md={12}>
     <Form.Group className="form-inline-field">
      <Form.Label>Address 2</Form.Label>
      <Form.Control type="text" name="address2" value={details.address2} onChange={onChange}/>
     </Form.Group>
    </Col>
   </Row>

   <div className="admin-user-location-form-row">
    <Form.Group className="form-inline-field is-city">
     <Form.Label>City</Form.Label>
     <Form.Control type="text" name="city" value={details.city} onChange={onChange}/>
    </Form.Group>

    <Form.Group className="form-inline-field is-state">
     <Form.Label>State</Form.Label>
     <Form.Select name="state" value={isUnitedStates?details.state:""} onChange={onChange} disabled={!isUnitedStates}>
      <option value="">{isUnitedStates?"Select State":"U.S. only"}</option>
      {states.map(state=><option key={state._id} value={state._id}>{state.name}</option>)}
     </Form.Select>
    </Form.Group>

    <Form.Group className="form-inline-field is-country">
     <Form.Label>Country</Form.Label>
     <Form.Select name="country" value={details.country} onChange={onChange}>
      <option value="">Select Country</option>
      {countries.map(country=><option key={country._id} value={country._id}>{country.name}</option>)}
     </Form.Select>
    </Form.Group>

    <Form.Group className="form-inline-field is-postal-code">
     <Form.Label>Postal Code</Form.Label>
     <Form.Control type="text" name="postalCode" value={details.postalCode} onChange={onChange}/>
    </Form.Group>
   </div>

   <div className="admin-user-county-form-row">
    <Form.Group className="form-inline-field">
     <Form.Label>County</Form.Label>
     <Form.Select name="county" value={isUnitedStates&&details.state?details.county:""} onChange={onChange} disabled={!isUnitedStates||!details.state}>
      <option value="">{!isUnitedStates?"U.S. addresses only":details.state?"Select County":"Select a state first"}</option>
      {availableCounties.map(county=><option key={county._id} value={county._id}>{county.name}</option>)}
     </Form.Select>
    </Form.Group>
   </div>

   <Row className="mb-3">
    <Col md={12}>
     <Form.Group className="form-inline-field admin-user-avatar-field">
      <Form.Label>Avatar</Form.Label>
      <div className="admin-user-avatar-control">
       {avatarPreview&&<img src={avatarPreview} alt="Avatar preview" className="admin-user-avatar-preview"/>}
       <div className="flex-grow-1">
        <Form.Control key={avatarInputKey} type="file" accept="image/*" onChange={onAvatarFileChange}/>
        {avatarUploading&&<div className="mt-2 small text-muted">Uploading avatar...</div>}
        {avatarFile&&!avatarUploading&&<div className="mt-2 small text-muted">{avatarFile.name}</div>}
        {!avatarFile&&details.avatar&&<div className="mt-2 small text-muted">{details.avatar}</div>}
        {details.avatar&&<Button type="button" size="sm" variant="outline-secondary" className="mt-2" onClick={onAvatarClear}>Clear Avatar</Button>}
       </div>
      </div>
      {avatarError&&<Alert variant="danger" className="mt-2 mb-0 py-2">{avatarError}</Alert>}
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3 form-inline-field admin-user-notes-field">
    <Form.Label>Notes</Form.Label>
    <div className="admin-user-notes-control">
     {details.notes.map((note,index)=>(
      <div key={index} className="d-flex gap-2 mb-2">
       <Form.Control as="textarea" rows={2} value={note} onChange={e=>onNoteChange(index,e.target.value)}/>
       <Button type="button" variant="outline-danger" onClick={()=>onRemoveNote(index)}>Remove</Button>
      </div>
     ))}
     <Button type="button" size="sm" variant="outline-primary" onClick={onAddNote}>Add Note</Button>
    </div>
   </Form.Group>
  </>
 );
}
