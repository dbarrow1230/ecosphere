import {useState,useEffect} from "react";
import {Form,Button,Row,Col,Tabs,Tab} from "react-bootstrap";
import Alert from "../../../../components/PopupAlert.jsx";
import UserDetailsForm from "./UserDetailsForm";

export default function UserForm({user,businessId="",onSuccess})
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
  department:"",
  role:"",
  isActive:true,
  details:{...emptyDetails}
 });

 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [states,setStates]=useState([]);
 const [counties,setCounties]=useState([]);
 const [countries,setCountries]=useState([]);
 const [roles,setRoles]=useState([]);
 const [departments,setDepartments]=useState([]);
 const [activeTab,setActiveTab]=useState("account");
 const [avatarFile,setAvatarFile]=useState(null);
 const [avatarPreview,setAvatarPreview]=useState("");
 const [avatarUploading,setAvatarUploading]=useState(false);
 const [avatarError,setAvatarError]=useState("");
 const [avatarInputKey,setAvatarInputKey]=useState(0);
 const [detailsId,setDetailsId]=useState("");

 const getObjectId=value=>{
  if(!value)
  {
   return "";
  }

  if(typeof value==="string")
  {
   return value;
  }

  if(typeof value==="object")
  {
   if(typeof value.$oid==="string")
   {
    return value.$oid;
   }

   if(typeof value._id==="string")
   {
    return value._id;
   }

   if(typeof value.id==="string")
   {
    return value.id;
   }

   if(typeof value._id?.$oid==="string")
   {
    return value._id.$oid;
   }

   if(typeof value.id?.$oid==="string")
   {
    return value.id.$oid;
   }
  }

  return "";
 };

 const getRoleId=role=>{
  return getObjectId(role);
 };

 const getResponseError=(data,fallback)=>{
  if(data?.error&&String(data?.message||"").toLowerCase().startsWith("failed"))
  {
   return data.error;
  }

  return data?.message||data?.error||fallback;
 };

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

 const fetchRoles=async()=>{
  try
  {
   if(!businessId)
   {
    setRoles([]);
    return;
   }

   const res=await fetch(`/api/users/roles?business=${encodeURIComponent(String(businessId))}`);
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setRoles(data.data);
   }
   else if(Array.isArray(data.roles))
   {
    setRoles(data.roles);
   }
   else if(Array.isArray(data))
   {
    setRoles(data);
   }
   else
   {
    setRoles([]);
   }
  }
  catch(err)
  {
   console.error("Role load error",err);
   setRoles([]);
  }
 };

 const fetchCountries=async()=>{
  try
  {
   const res=await fetch("/api/countries");
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setCountries(data.data);
   }
   else if(Array.isArray(data.countries))
   {
    setCountries(data.countries);
   }
   else if(Array.isArray(data))
   {
    setCountries(data);
   }
   else
   {
    setCountries([]);
   }
  }
  catch(err)
  {
   console.error("Country load error",err);
   setCountries([]);
  }
 };

 const fetchDepartments=async()=>{
  try
  {
   if(!businessId)
   {
    setDepartments([]);
    return;
   }

   const res=await fetch(`/api/users/business-departments?business=${encodeURIComponent(String(businessId))}&isActive=true`);
   const data=await res.json();

   if(Array.isArray(data.data))
   {
    setDepartments(data.data);
   }
   else if(Array.isArray(data.departments))
   {
    setDepartments(data.departments);
   }
   else if(Array.isArray(data))
   {
    setDepartments(data);
   }
   else
   {
    setDepartments([]);
   }
  }
  catch(err)
  {
   console.error("Department load error",err);
   setDepartments([]);
  }
 };

 const fetchBusinessRoleAssignment=async(userId,activeOnly=true)=>{
  if(!userId||!businessId)
  {
   return null;
  }

  try
  {
   const activeQuery=activeOnly?"&isActive=true":"";
   const res=await fetch(`/api/users/role-assignments?user=${encodeURIComponent(String(userId))}&business=${encodeURIComponent(String(businessId))}${activeQuery}`);
   const data=await res.json();

   if(!res.ok)
   {
    return null;
   }

   const assignments=Array.isArray(data.data)?data.data:Array.isArray(data)?data:[];
   return assignments.length?assignments[0]:null;
  }
  catch(err)
  {
   console.error("Role assignment load error",err);
   return null;
  }
 };

 const fetchBusinessDepartmentAssignment=async(userId,activeOnly=true)=>{
  if(!userId||!businessId)
  {
   return null;
  }

  try
  {
   const activeQuery=activeOnly?"&isActive=true":"";
   const res=await fetch(`/api/users/department-assignments?user=${encodeURIComponent(String(userId))}&business=${encodeURIComponent(String(businessId))}${activeQuery}`);
   const data=await res.json();

   if(!res.ok)
   {
    return null;
   }

   const assignments=Array.isArray(data.data)?data.data:Array.isArray(data)?data:[];
   return assignments.length?assignments[0]:null;
  }
  catch(err)
  {
   console.error("Department assignment load error",err);
   return null;
  }
 };

 const syncBusinessDepartmentAssignment=async(userId,departmentId,roleId)=>{
  if(!userId||!businessId)
  {
   return;
  }

  const existingAssignment=await fetchBusinessDepartmentAssignment(userId,false);

  if(!departmentId)
  {
   if(existingAssignment?._id)
   {
    const res=await fetch(`/api/users/department-assignments/${existingAssignment._id}`,{
     method:"PUT",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({isActive:false})
    });
    const data=await res.json();
    if(!res.ok)throw new Error(getResponseError(data,"Failed to update department assignment"));
   }

   return;
  }

  const payload={
   user:userId,
   business:businessId,
   department:departmentId,
   role:roleId||null,
   isPrimary:true,
   isActive:true
  };

  const res=await fetch(existingAssignment?._id?`/api/users/department-assignments/${existingAssignment._id}`:"/api/users/department-assignments",{
   method:existingAssignment?._id?"PUT":"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify(payload)
  });
  const data=await res.json();

  if(!res.ok)
  {
   throw new Error(getResponseError(data,"Failed to save department assignment"));
  }
 };

 const syncBusinessRoleAssignment=async(userId,roleId)=>{
  if(!userId||!businessId)
  {
   return;
  }

  const existingAssignment=await fetchBusinessRoleAssignment(userId,false);

  if(!roleId)
  {
   if(existingAssignment?._id)
   {
    const res=await fetch(`/api/users/role-assignments/${existingAssignment._id}`,{
     method:"PUT",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({isActive:false})
    });
    const data=await res.json();
    if(!res.ok)throw new Error(getResponseError(data,"Failed to update role assignment"));
   }

   return;
  }

  const payload={
   user:userId,
   business:businessId,
   role:roleId,
   isActive:true
  };

  const res=await fetch(existingAssignment?._id?`/api/users/role-assignments/${existingAssignment._id}`:"/api/users/role-assignments",{
   method:existingAssignment?._id?"PUT":"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify(payload)
  });
  const data=await res.json();

  if(!res.ok)
  {
   throw new Error(getResponseError(data,"Failed to save role assignment"));
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
   country:typeof details.country==="object"&&details.country?details.country._id||"":details.country||"",
   avatar:details.avatar||"",
   notes:Array.isArray(details.notes)&&details.notes.length?details.notes:[""]
  };
 };

 useEffect(()=>{
  fetchStates();
  fetchCounties();
  fetchCountries();
  fetchRoles();
  fetchDepartments();
 },[businessId]);

 useEffect(()=>{
  const loadUserForm=async()=>{
   if(!user)
   {
    setForm({
     username:"",
     email:"",
     password:"",
     department:"",
     role:"",
     isActive:true,
     details:{...emptyDetails}
    });
    setDetailsId("");
    setActiveTab("account");
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarInputKey(prev=>prev+1);
    return;
   }

   setForm({
    username:user.username||"",
    email:user.email||"",
    password:"",
    department:getObjectId(user.businessDepartmentAssignment?.department),
    role:getRoleId(user.role),
    isActive:user.isActive!==undefined?user.isActive:true,
    details:{...emptyDetails}
   });

   setDetailsId(getObjectId(user.details));
   setAvatarFile(null);
   setAvatarPreview("");
   setAvatarInputKey(prev=>prev+1);

   if(user.details&&typeof user.details==="object")
   {
    const normalizedDetails=normalizeDetails(user.details);

    setForm(prev=>({
     ...prev,
     details:normalizedDetails
    }));

    setAvatarPreview(normalizedDetails.avatar?`/avatars/${normalizedDetails.avatar}`:"");
   }

   try
   {
    const departmentAssignment=await fetchBusinessDepartmentAssignment(user._id);

    if(departmentAssignment?.department)
    {
     setForm(prev=>({
      ...prev,
      department:getObjectId(departmentAssignment.department),
      role:getRoleId(departmentAssignment.role)||prev.role
     }));
    }

    const assignment=await fetchBusinessRoleAssignment(user._id);

    if(!departmentAssignment?.role&&assignment?.role)
    {
     setForm(prev=>({
      ...prev,
      role:getRoleId(assignment.role)
     }));
    }

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
 },[user,businessId]);

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

 const uploadAvatarFile=async(file)=>{
  if(!file)
  {
   return "";
  }

  setAvatarUploading(true);
  setAvatarError("");

  try
  {
   const formData=new FormData();
   formData.append("file",file);

   const res=await fetch("/api/upload/avatars",{
    method:"POST",
    body:formData
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to upload avatar");
   }

   const filename=data.filename||file.name||"";

   setForm(prev=>({
    ...prev,
    details:{
     ...prev.details,
     avatar:filename
    }
   }));

   setAvatarPreview(filename?`/avatars/${filename}`:"");
   setAvatarFile(null);
   return filename;
  }
  catch(err)
  {
   console.error("Avatar upload error",err);
   setAvatarError(err.message||"Failed to upload avatar");
   throw err;
  }
  finally
  {
   setAvatarUploading(false);
  }
 };

 const handleAvatarClear=()=>{
  setAvatarFile(null);
  setAvatarPreview("");
  setAvatarError("");
  setAvatarInputKey(prev=>prev+1);
  setForm(prev=>({
   ...prev,
   details:{
    ...prev.details,
    avatar:""
   }
  }));
 };

 const handleClear=()=>{
  setForm({
   username:"",
   email:"",
   password:"",
   department:"",
   role:"",
   isActive:true,
   details:{...emptyDetails}
  });
  setDetailsId("");
  setError("");
  setAvatarError("");
  setAvatarFile(null);
  setAvatarPreview("");
  setAvatarInputKey(prev=>prev+1);
  setActiveTab("account");
 };

 const handleAvatarFileChange=async(e)=>{
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

  if(file)
  {
   await uploadAvatarFile(file);
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
   if(!businessId)
   {
    throw new Error("No current business is selected for this user.");
   }

   const cleanDetails={
    ...form.details,
    notes:form.details.notes.map(note=>note.trim()).filter(Boolean)
   };

   if(user)
   {
    let resolvedDetailsId=detailsId;
    let finalUser=user;
    const payload={
     username:form.username,
     email:form.email,
     role:null,
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

    finalUser=userData.data||userData.user||userData;

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

    if(resolvedDetailsId!==getObjectId(userData.data?.details))
    {
     const linkUserRes=await fetch(`/api/users/${user._id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
       username:form.username,
       email:form.email,
       role:null,
       isActive:form.isActive,
       details:resolvedDetailsId||null
      })
     });

     const linkUserData=await linkUserRes.json();

     if(!linkUserRes.ok)
     {
      throw new Error(linkUserData?.message||"Failed to link user details");
     }

     finalUser=linkUserData.data||linkUserData.user||linkUserData;
    }

    await syncBusinessDepartmentAssignment(user._id,form.department||null,form.department?form.role||null:null);
    if(!form.department)
    {
     await syncBusinessRoleAssignment(user._id,form.role||null);
    }
    else
    {
     await syncBusinessRoleAssignment(user._id,null);
    }

    if(onSuccess)
    {
     onSuccess(finalUser);
    }
   }
   else
   {
    const createUserPayload={
     username:form.username,
     email:form.email,
     password:form.password,
     role:null,
     business:businessId||null,
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

    const existingDetailsId=getObjectId(createdUser.details);
    const detailsRes=await fetch(existingDetailsId?`/api/users/details/${existingDetailsId}`:"/api/users/details",{
     method:existingDetailsId?"PUT":"POST",
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

    const newDetailsId=detailsData.data?._id||existingDetailsId||"";
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
       role:null,
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

    await syncBusinessDepartmentAssignment(createdUser._id,form.department||null,form.department?form.role||null:null);
    if(!form.department)
    {
     await syncBusinessRoleAssignment(createdUser._id,form.role||null);
    }
    else
    {
     await syncBusinessRoleAssignment(createdUser._id,null);
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
        <Form.Label>Department</Form.Label>
        <Form.Select name="department" value={form.department} onChange={handleChange}>
         <option value="">No Department</option>
         {departments.map(department=>(
          <option key={department._id} value={department._id}>{department.name}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={3}>
       <Form.Group>
        <Form.Label>{form.department?"Role Override":"Role"}</Form.Label>
        <Form.Select name="role" value={form.role} onChange={handleChange}>
         <option value="">{form.department?"Use Department Default":"Select Role"}</option>
         {roles.map(role=>(
          <option key={role._id} value={role._id}>{role.name}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={12} className="d-flex align-items-end">
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
       countries={countries}
       onChange={handleDetailsChange}
       onPhoneChange={handlePhoneChange}
       onCellChange={handleCellChange}
       onNoteChange={handleNoteChange}
       onAddNote={handleAddNote}
       onRemoveNote={handleRemoveNote}
       onAvatarFileChange={handleAvatarFileChange}
       onAvatarClear={handleAvatarClear}
       avatarFile={avatarFile}
       avatarPreview={avatarPreview}
       avatarUploading={avatarUploading}
       avatarError={avatarError}
       avatarInputKey={avatarInputKey}
      />
     </div>

    </Tab>

   </Tabs>

   <div className="d-flex gap-2">
    <Button type="submit" disabled={saving||avatarUploading}>{saving?"Saving...":user?"Update User":"Create User"}</Button>
    {!user&&<Button type="button" variant="outline-secondary" onClick={handleClear} disabled={saving||avatarUploading}>Clear</Button>}
   </div>
  </Form>
 );
}
