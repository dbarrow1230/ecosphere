import {useState,useEffect} from "react";
import {Form,Button,Row,Col,Tabs,Tab,Alert} from "react-bootstrap";
import UserDetailsForm from "./UserDetailsForm";

export default function UserForm({user,onSuccess})
{
 const emptyDetails={
  firstName:"",
  lastName:"",
  phone:"",
  cell:"",
  address1:"",
  address2:"",
  city:"",
  state:"",
  county:"",
  postalCode:"",
  country:"",
  avatar:"",
  notes:[""]
 };

 const [form,setForm]=useState({
  username:"",
  email:"",
  password:"",
  role:"user",
  isActive:true,
  details:{...emptyDetails}
 });

 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [states,setStates]=useState([]);
 const [counties,setCounties]=useState([]);
 const [activeTab,setActiveTab]=useState("account");
 const [avatarFile,setAvatarFile]=useState(null);
 const [avatarPreview,setAvatarPreview]=useState("");
 const [avatarUploading,setAvatarUploading]=useState(false);
 const [avatarError,setAvatarError]=useState("");
 const [detailsId,setDetailsId]=useState("");

 const fetchStates=async()=>{
  try
  {
   const res=await fetch("/api/states");
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setStates(data.data);
   }
   else if(Array.isArray(data.states))
   {
    setStates(data.states);
   }
   else if(Array.isArray(data))
   {
    setStates(data);
   }
   else
   {
    setStates([]);
   }
  }
  catch(err)
  {
   console.error("State load error",err);
   setStates([]);
  }
 };

 const fetchCounties=async()=>{
  try
  {
   const res=await fetch("/api/counties");
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setCounties(data.data);
   }
   else if(Array.isArray(data.counties))
   {
    setCounties(data.counties);
   }
   else if(Array.isArray(data))
   {
    setCounties(data);
   }
   else
   {
    setCounties([]);
   }
  }
  catch(err)
  {
   console.error("County load error",err);
   setCounties([]);
  }
 };

 const normalizeDetails=(details)=>{
  if(!details)
  {
   return {...emptyDetails};
  }

  return{
   firstName:details.firstName||"",
   lastName:details.lastName||"",
   phone:details.phone||"",
   cell:details.cell||"",
   address1:details.address1||"",
   address2:details.address2||"",
   city:details.city||"",
   state:typeof details.state==="object"&&details.state?details.state._id||"":details.state||"",
   county:typeof details.county==="object"&&details.county?details.county._id||"":details.county||"",
   postalCode:details.postalCode||"",
   country:details.country||"",
   avatar:details.avatar||"",
   notes:Array.isArray(details.notes)&&details.notes.length?details.notes:[""]
  };
 };

 useEffect(()=>{
  fetchStates();
  fetchCounties();
 },[]);

 useEffect(()=>{
  const loadUserForm=async()=>{
   if(!user)
   {
    setForm({
     username:"",
     email:"",
     password:"",
     role:"user",
     isActive:true,
     details:{...emptyDetails}
    });
    setDetailsId("");
    setActiveTab("account");
    setAvatarFile(null);
    setAvatarPreview("");
    return;
   }

   setForm({
    username:user.username||"",
    email:user.email||"",
    password:"",
    role:user.role||"user",
    isActive:user.isActive!==undefined?user.isActive:true,
    details:{...emptyDetails}
   });

   setDetailsId("");
   setAvatarFile(null);
   setAvatarPreview("");

   try
   {
    const res=await fetch(`/api/users/details?user=${user._id}`);
    const data=await res.json();

    if(res.ok&&Array.isArray(data.data)&&data.data.length>0)
    {
     const associatedDetails=data.data[0];
     const normalizedDetails=normalizeDetails(associatedDetails);

     setDetailsId(associatedDetails._id||"");

     setForm(prev=>({
      ...prev,
      details:normalizedDetails
     }));

     setAvatarPreview(normalizedDetails.avatar?`/avatars/${normalizedDetails.avatar}`:"");
    }
   }
   catch(err)
   {
    console.error("Associated user details load error",err);
   }
  };

  loadUserForm();
 },[user]);

 useEffect(()=>{
  if(!avatarFile)
  {
   return;
  }

  const objectUrl=URL.createObjectURL(avatarFile);
  setAvatarPreview(objectUrl);

  return()=>{
   URL.revokeObjectURL(objectUrl);
  };
 },[avatarFile]);

 const handleChange=(e)=>{
  const {name,value,type,checked}=e.target;

  setForm(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleDetailsChange=(e)=>{
  const {name,value}=e.target;

  setForm(prev=>({
   ...prev,
   details:{
    ...prev.details,
    [name]:value
   }
  }));
 };

 const handlePhoneChange=(value)=>{
  setForm(prev=>({
   ...prev,
   details:{
    ...prev.details,
    phone:value
   }
  }));
 };

 const handleCellChange=(value)=>{
  setForm(prev=>({
   ...prev,
   details:{
    ...prev.details,
    cell:value
   }
  }));
 };

 const handleAvatarFileChange=(e)=>{
  const file=e.target.files&&e.target.files[0]?e.target.files[0]:null;
  setAvatarFile(file);
  setAvatarError("");

  if(!file&&form.details.avatar)
  {
   setAvatarPreview(`/avatars/${form.details.avatar}`);
  }

  if(!file&&!form.details.avatar)
  {
   setAvatarPreview("");
  }
 };

 const handleAvatarUpload=async()=>{
  if(!avatarFile)
  {
   return;
  }

  setAvatarUploading(true);
  setAvatarError("");

  try
  {
   const formData=new FormData();
   formData.append("file",avatarFile);
   formData.append("type","avatar");

   const res=await fetch("/api/upload/avatar",{
    method:"POST",
    body:formData
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to upload avatar");
   }

   setForm(prev=>({
    ...prev,
    details:{
     ...prev.details,
     avatar:data.filename||""
    }
   }));

   setAvatarPreview(data.filename?`/avatars/${data.filename}`:"");
   setAvatarFile(null);
  }
  catch(err)
  {
   console.error("Avatar upload error",err);
   setAvatarError(err.message||"Failed to upload avatar");
  }
  finally
  {
   setAvatarUploading(false);
  }
 };

 const handleNoteChange=(index,value)=>{
  setForm(prev=>{
   const nextNotes=[...prev.details.notes];
   nextNotes[index]=value;

   return{
    ...prev,
    details:{
     ...prev.details,
     notes:nextNotes
    }
   };
  });
 };

 const handleAddNote=()=>{
  setForm(prev=>({
   ...prev,
   details:{
    ...prev.details,
    notes:[...prev.details.notes,""]
   }
  }));
 };

 const handleRemoveNote=(index)=>{
  setForm(prev=>{
   const nextNotes=prev.details.notes.filter((_,i)=>i!==index);

   return{
    ...prev,
    details:{
     ...prev.details,
     notes:nextNotes.length?nextNotes:[""]
    }
   };
  });
 };

 const handleSubmit=async(e)=>{
  e.preventDefault();
  setSaving(true);
  setError("");

  try
  {
   const cleanDetails={
    ...form.details,
    notes:form.details.notes.map(note=>note.trim()).filter(Boolean)
   };

   if(user)
   {
    let resolvedDetailsId=detailsId;

    if(resolvedDetailsId)
    {
     const detailsRes=await fetch(`/api/users/details/${resolvedDetailsId}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
       user:user._id,
       ...cleanDetails
      })
     });

     const detailsData=await detailsRes.json();

     if(!detailsRes.ok)
     {
      throw new Error(detailsData?.message||"Failed to update user details");
     }

     resolvedDetailsId=detailsData.data?._id||resolvedDetailsId;
     setDetailsId(resolvedDetailsId);
    }
    else
    {
     const detailsRes=await fetch("/api/users/details",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
       user:user._id,
       ...cleanDetails
      })
     });

     const detailsData=await detailsRes.json();

     if(!detailsRes.ok)
     {
      throw new Error(detailsData?.message||"Failed to create user details");
     }

     resolvedDetailsId=detailsData.data?._id||"";
     setDetailsId(resolvedDetailsId);
    }

    const payload={
     username:form.username,
     email:form.email,
     role:form.role,
     isActive:form.isActive,
     details:resolvedDetailsId||null
    };

    if(form.password.trim())
    {
     payload.password=form.password;
    }

    const userRes=await fetch(`/api/users/${user._id}`,{
     method:"PUT",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify(payload)
    });

    const userData=await userRes.json();

    if(!userRes.ok)
    {
     throw new Error(userData?.message||"Failed to save user");
    }

    if(onSuccess)
    {
     onSuccess(userData.data||userData.user||userData);
    }
   }
   else
   {
    const createUserPayload={
     username:form.username,
     email:form.email,
     password:form.password,
     role:form.role,
     isActive:form.isActive
    };

    const createUserRes=await fetch("/api/users",{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify(createUserPayload)
    });

    const createUserData=await createUserRes.json();

    if(!createUserRes.ok)
    {
     throw new Error(createUserData?.message||"Failed to create user");
    }

    const createdUser=createUserData.data||createUserData.user||createUserData;

    if(!createdUser?._id)
    {
     throw new Error("Created user id not returned");
    }

    const detailsRes=await fetch("/api/users/details",{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({
      user:createdUser._id,
      ...cleanDetails
     })
    });

    const detailsData=await detailsRes.json();

    if(!detailsRes.ok)
    {
     throw new Error(detailsData?.message||"Failed to create user details");
    }

    const newDetailsId=detailsData.data?._id||"";
    setDetailsId(newDetailsId);

    let finalUser=createdUser;

    if(newDetailsId)
    {
     const linkUserRes=await fetch(`/api/users/${createdUser._id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
       username:form.username,
       email:form.email,
       role:form.role,
       isActive:form.isActive,
       details:newDetailsId
      })
     });

     const linkUserData=await linkUserRes.json();

     if(!linkUserRes.ok)
     {
      throw new Error(linkUserData?.message||"Failed to link user details");
     }

     finalUser=linkUserData.data||linkUserData.user||linkUserData;
    }

    if(onSuccess)
    {
     onSuccess(finalUser);
    }
   }
  }
  catch(err)
  {
   console.error("User save error",err);
   setError(err.message||"Failed to save user");
  }
  finally
  {
   setSaving(false);
  }
 };

 return(
  <Form onSubmit={handleSubmit}>
   {error&&<Alert variant="danger">{error}</Alert>}

   <Tabs activeKey={activeTab} onSelect={key=>setActiveTab(key||"account")} className="mb-3">

    <Tab eventKey="account" title="Account">

     <Row className="mb-3 mt-3">

      <Col md={6}>
       <Form.Group>
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" name="username" value={form.username} onChange={handleChange} required/>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group>
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required/>
       </Form.Group>
      </Col>

     </Row>

     <Row className="mb-3">

      <Col md={6}>
       <Form.Group>
        <Form.Label>{user?"Password (leave blank to keep current)":"Password"}</Form.Label>
        <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required={!user}/>
       </Form.Group>
      </Col>

      <Col md={3}>
       <Form.Group>
        <Form.Label>Role</Form.Label>
        <Form.Select name="role" value={form.role} onChange={handleChange}>
         <option value="admin">admin</option>
         <option value="user">user</option>
         <option value="staff">staff</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={3} className="d-flex align-items-end">
       <Form.Check type="checkbox" label="Active" name="isActive" checked={form.isActive} onChange={handleChange}/>
      </Col>

     </Row>

    </Tab>

    <Tab eventKey="details" title="User Details">

     <div className="mt-3">
      <UserDetailsForm
       details={form.details}
       states={states}
       counties={counties}
       onChange={handleDetailsChange}
       onPhoneChange={handlePhoneChange}
       onCellChange={handleCellChange}
       onNoteChange={handleNoteChange}
       onAddNote={handleAddNote}
       onRemoveNote={handleRemoveNote}
       onAvatarFileChange={handleAvatarFileChange}
       onAvatarUpload={handleAvatarUpload}
       avatarFile={avatarFile}
       avatarPreview={avatarPreview}
       avatarUploading={avatarUploading}
       avatarError={avatarError}
      />
     </div>

    </Tab>

   </Tabs>

   <Button type="submit" disabled={saving}>{saving?"Saving...":user?"Update User":"Create User"}</Button>
  </Form>
 );
}