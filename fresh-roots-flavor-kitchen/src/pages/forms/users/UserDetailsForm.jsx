import {Form,Button,Row,Col,Alert,Spinner} from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

export default function UserDetailsForm({
 details,
 states,
 counties,
 countries,
 onChange,
 onPhoneChange,
 onCellChange,
 onNoteChange,
 onAddNote,
 onRemoveNote,
 onAvatarFileChange,
 onAvatarUpload,
 avatarFile,
 avatarUploading,
 avatarError
})
{
 const selectedCountry=countries.find(country=>String(country._id)===String(details.country));
 const allowsRegion=String(selectedCountry?.iso2||"").toUpperCase()==="US";
 const availableCounties=counties.filter(county=>{
  const stateId=typeof county.state==="object"?county.state?._id:county.state;
  const countryId=typeof county.country==="object"?county.country?._id:county.country;
  return (!details.state||String(stateId)===String(details.state))&&(!details.country||String(countryId)===String(details.country));
 });

 return(
  <>

   <Row className="mb-3">

    <Col md={6}>
     <Form.Group>
      <Form.Label>First Name</Form.Label>
      <Form.Control type="text" name="firstName" value={details.firstName} onChange={onChange}/>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Last Name</Form.Label>
      <Form.Control type="text" name="lastName" value={details.lastName} onChange={onChange}/>
     </Form.Group>
    </Col>

   </Row>

   <Row className="mb-3">

    <Col md={6}>
     <Form.Group>
      <Form.Label>Phone</Form.Label>
      <PhoneInput
       country={"us"}
       value={details.phone}
       onChange={onPhoneChange}
       inputProps={{name:"phone"}}
       inputStyle={{width:"100%"}}
       buttonStyle={{borderTopLeftRadius:"0.375rem",borderBottomLeftRadius:"0.375rem"}}
       containerClass="w-100"
      />
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Cell</Form.Label>
      <PhoneInput
       country={"us"}
       value={details.cell}
       onChange={onCellChange}
       inputProps={{name:"cell"}}
       inputStyle={{width:"100%"}}
       buttonStyle={{borderTopLeftRadius:"0.375rem",borderBottomLeftRadius:"0.375rem"}}
       containerClass="w-100"
      />
     </Form.Group>
    </Col>

   </Row>

   <Row className="mb-3">

    <Col md={6}>
     <Form.Group>
      <Form.Label>Address 1</Form.Label>
      <Form.Control type="text" name="address1" value={details.address1} onChange={onChange}/>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Address 2</Form.Label>
      <Form.Control type="text" name="address2" value={details.address2} onChange={onChange}/>
     </Form.Group>
    </Col>

   </Row>

   <Row className="mb-3">

    <Col md={4}>
     <Form.Group>
      <Form.Label>City</Form.Label>
      <Form.Control type="text" name="city" value={details.city} onChange={onChange}/>
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>State</Form.Label>
      <Form.Select name="state" value={details.state} onChange={onChange} disabled={!allowsRegion}>
       <option value="">Select State</option>
       {states.map(state=><option key={state._id} value={state._id}>{state.name}</option>)}
      </Form.Select>
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>County</Form.Label>
      <Form.Select name="county" value={details.county} onChange={onChange} disabled={!allowsRegion||!details.state}>
       <option value="">Select County</option>
       {availableCounties.map(county=><option key={county._id} value={county._id}>{county.name}</option>)}
      </Form.Select>
     </Form.Group>
    </Col>

   </Row>

   <Row className="mb-3">

    <Col md={4}>
     <Form.Group>
      <Form.Label>Postal Code</Form.Label>
      <Form.Control type="text" name="postalCode" value={details.postalCode} onChange={onChange}/>
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>Country</Form.Label>
      <Form.Select name="country" value={details.country} onChange={onChange}>
       <option value="">Select Country</option>
       {countries.map(country=><option key={country._id} value={country._id}>{country.name}</option>)}
      </Form.Select>
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>Avatar</Form.Label>
      <div className="d-flex gap-2">
       <Form.Control type="file" accept="image/*" onChange={onAvatarFileChange}/>
       <Button type="button" variant="outline-primary" onClick={onAvatarUpload} disabled={!avatarFile||avatarUploading}>{avatarUploading?<Spinner size="sm" animation="border"/>:"Upload"}</Button>
      </div>
      {details.avatar&&<div className="mt-2 small text-muted">{details.avatar}</div>}
      {avatarError&&<Alert variant="danger" className="mt-2 mb-0 py-2">{avatarError}</Alert>}
     </Form.Group>
    </Col>

   </Row>

   <Form.Group className="mb-3">
    <div className="d-flex justify-content-between align-items-center mb-2">
     <Form.Label className="mb-0">Notes</Form.Label>
     <Button type="button" size="sm" variant="outline-primary" onClick={onAddNote}>Add Note</Button>
    </div>

    {details.notes.map((note,index)=>(
     <div key={index} className="d-flex gap-2 mb-2">
      <Form.Control as="textarea" rows={2} value={note} onChange={e=>onNoteChange(index,e.target.value)}/>
      <Button type="button" variant="outline-danger" onClick={()=>onRemoveNote(index)}>Remove</Button>
     </div>
    ))}

   </Form.Group>

  </>
 );
}
