// src/pages/forms/users/UserDetailsForm.jsx
import {Form,Button,Row,Col,Alert} from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

export default function UserDetailsForm({
 details={},
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
}){
 const getObjectId=value=>{
  if(!value)return "";

  if(typeof value==="string")return value;

  if(typeof value==="object"){
   if(typeof value.$oid==="string")return value.$oid;
   if(typeof value._id?.$oid==="string")return value._id.$oid;
   if(typeof value._id==="string")return value._id;
   if(typeof value.id?.$oid==="string")return value.id.$oid;
   if(typeof value.id==="string")return value.id;
  }

  return "";
 };

 const getField=value=>{
  if(value===undefined||value===null)return "";
  return value;
 };

 const getNotes=()=>{
  return Array.isArray(details.notes)?details.notes:[];
 };

 const getAvatarDisplay=()=>{
  if(avatarPreview)return avatarPreview;
  if(!details.avatar)return "";

  if(
   String(details.avatar).startsWith("http://")||
   String(details.avatar).startsWith("https://")||
   String(details.avatar).startsWith("/")
  ){
   return details.avatar;
  }

  return `/avatars/${details.avatar}`;
 };

 return(
  <>
   <Row className="mb-3">
    <Col md={6}>
     <Form.Group>
      <Form.Label>First Name</Form.Label>
      <Form.Control
       type="text"
       name="firstName"
       value={getField(details.firstName)}
       onChange={onChange}
      />
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Last Name</Form.Label>
      <Form.Control
       type="text"
       name="lastName"
       value={getField(details.lastName)}
       onChange={onChange}
      />
     </Form.Group>
    </Col>
   </Row>

   <Row className="mb-3">
    <Col md={6}>
     <Form.Group>
      <Form.Label>Phone</Form.Label>
      <PhoneInput
       country="us"
       value={getField(details.phone)}
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
       country="us"
       value={getField(details.cell)}
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
      <Form.Control
       type="text"
       name="address1"
       value={getField(details.address1)}
       onChange={onChange}
      />
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Address 2</Form.Label>
      <Form.Control
       type="text"
       name="address2"
       value={getField(details.address2)}
       onChange={onChange}
      />
     </Form.Group>
    </Col>
   </Row>

   <Row className="mb-3">
    <Col md={4}>
     <Form.Group>
      <Form.Label>City</Form.Label>
      <Form.Control
       type="text"
       name="city"
       value={getField(details.city)}
       onChange={onChange}
      />
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>State</Form.Label>
      <Form.Select
       name="state"
       value={getObjectId(details.state)}
       onChange={onChange}
      >
       <option value="">Select State</option>
       {states.map(state=>(
        <option key={getObjectId(state)} value={getObjectId(state)}>
         {state.name}{state.abbreviation?` (${state.abbreviation})`:""}
        </option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>County</Form.Label>
      <Form.Select
       name="county"
       value={getObjectId(details.county)}
       onChange={onChange}
      >
       <option value="">Select County</option>
       {counties.map(county=>(
        <option key={getObjectId(county)} value={getObjectId(county)}>
         {county.name}
        </option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>
   </Row>

   <Row className="mb-3">
    <Col md={4}>
     <Form.Group>
      <Form.Label>Postal Code</Form.Label>
      <Form.Control
       type="text"
       name="postalCode"
       value={getField(details.postalCode)}
       onChange={onChange}
      />
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>Country</Form.Label>
      <Form.Select
       name="country"
       value={getObjectId(details.country)}
       onChange={onChange}
      >
       <option value="">Select Country</option>
       {countries.map(country=>(
        <option key={getObjectId(country)} value={getObjectId(country)}>
         {country.name}
        </option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>Avatar</Form.Label>

      <div className="d-flex gap-3 align-items-start">
       {getAvatarDisplay()?(
        <img
         src={getAvatarDisplay()}
         alt="Avatar preview"
         style={{
          width:"72px",
          height:"72px",
          objectFit:"cover",
          borderRadius:"var(--bs-border-radius)",
          border:"1px solid var(--bs-border-color)"
         }}
        />
       ):null}

       <div className="flex-grow-1">
        <Form.Control
         key={avatarInputKey}
         type="file"
         accept="image/*"
         onChange={onAvatarFileChange}
         disabled={avatarUploading}
        />

        {avatarUploading?(
         <div className="mt-2 small text-muted">Uploading avatar...</div>
        ):null}

        {avatarFile&&!avatarUploading?(
         <div className="mt-2 small text-muted">{avatarFile.name}</div>
        ):null}

        {!avatarFile&&details.avatar?(
         <div className="mt-2 small text-muted">{details.avatar}</div>
        ):null}

        {details.avatar?(
         <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          className="mt-2"
          onClick={onAvatarClear}
          disabled={avatarUploading}
         >
          Clear Avatar
         </Button>
        ):null}
       </div>
      </div>

      {avatarError?(
       <Alert variant="danger" className="mt-2 mb-0 py-2">
        {avatarError}
       </Alert>
      ):null}
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <div className="d-flex justify-content-between align-items-center mb-2">
     <Form.Label className="mb-0">Notes</Form.Label>
     <Button type="button" size="sm" variant="outline-primary" onClick={onAddNote}>
      Add Note
     </Button>
    </div>

    {getNotes().length?(
     getNotes().map((note,index)=>(
      <div key={index} className="d-flex gap-2 mb-2">
       <Form.Control
        as="textarea"
        rows={2}
        value={note}
        onChange={e=>onNoteChange(index,e.target.value)}
       />

       <Button type="button" variant="outline-danger" onClick={()=>onRemoveNote(index)}>
        Remove
       </Button>
      </div>
     ))
    ):(
     <div className="text-muted small">No notes added.</div>
    )}
   </Form.Group>
  </>
 );
}