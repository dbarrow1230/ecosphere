// src/pages/forms/users/UserForm.jsx
import {useState,useEffect} from "react";
import {Form,Button,Row,Col,Tabs,Tab,Alert} from "react-bootstrap";
import UserDetailsForm from "./UserDetailsForm";

export default function UserForm({user,businessId="",onSuccess}){
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
  businessRole:"",
  department:"",
  roleOverride:"",
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

 const getResponseError=(data,fallback)=>{
  if(data?.error&&String(data?.message||"").toLowerCase().startsWith("failed"))
   return data.error;

  return data?.message||data?.error||fallback;
 };

 const getAvatarUrl=value=>{
  if(!value)return "";

  if(
   String(value).startsWith("http://")||
   String(value).startsWith("https://")||
   String(value).startsWith("/")
  )return value;

  return `/avatars/${value}`;
 };

 const getPrimaryDepartmentAssignment=assignments=>{
  if(!Array.isArray(assignments)||!assignments.length)return null;
  return assignments.find(item=>item?.isPrimary)||assignments[0];
 };

 const normalizeDetails=details=>{
  if(!details)return {...emptyDetails};

  return{
   firstName:details.firstName||"",
   lastName:details.lastName||"",
   phone:details.phone||"",
   cell:details.cell||"",
   address1:details.address1||"",
   address2:details.address2||"",
   city:details.city||"",
   state:getObjectId(details.state),
   county:getObjectId(details.county),
   postalCode:details.postalCode||"",
   country:getObjectId(details.country),
   avatar:details.avatar||"",
   notes:Array.isArray(details.notes)&&details.notes.length?details.notes:[""]
  };
 };

 const fetchCollection=async(url,setter,keys=[])=>{
  try{
   const res=await fetch(url);
   const data=await res.json();

   if(Array.isArray(data?.data))setter(data.data);
   else{
    const found=keys.find(key=>Array.isArray(data?.[key]));
    if(found)setter(data[found]);
    else if(Array.isArray(data))setter(data);
    else setter([]);
   }
  }catch(err){
   console.error(`${url} load error`,err);
   setter([]);
  }
 };

 const fetchStates=async()=>{
  await fetchCollection("/api/states",setStates,["states"]);
 };

 const fetchCounties=async()=>{
  await fetchCollection("/api/counties",setCounties,["counties"]);
 };

 const fetchCountries=async()=>{
  await fetchCollection("/api/countries",setCountries,["countries"]);
 };

 const fetchRoles=async()=>{
  if(!businessId){
   setRoles([]);
   return;
  }

  await fetchCollection(
   `/api/users/roles?business=${encodeURIComponent(String(businessId))}&isActive=true`,
   setRoles,
   ["roles"]
  );
 };

 const fetchDepartments=async()=>{
  if(!businessId){
   setDepartments([]);
   return;
  }

  await fetchCollection(
   `/api/users/business-departments?business=${encodeURIComponent(String(businessId))}&isActive=true`,
   setDepartments,
   ["departments"]
  );
 };

 const fetchBusinessRoleAssignment=async(userId,activeOnly=true)=>{
  if(!userId||!businessId)return null;

  try{
   const activeQuery=activeOnly?"&isActive=true":"";
   const res=await fetch(`/api/users/role-assignments?user=${encodeURIComponent(String(userId))}&business=${encodeURIComponent(String(businessId))}${activeQuery}`);
   const data=await res.json();

   if(!res.ok)return null;

   const assignments=Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];

   return assignments.length?assignments[0]:null;
  }catch(err){
   console.error("Role assignment load error",err);
   return null;
  }
 };

 const fetchBusinessDepartmentAssignments=async(userId,activeOnly=true)=>{
  if(!userId||!businessId)return [];

  try{
   const activeQuery=activeOnly?"&isActive=true":"";
   const res=await fetch(`/api/users/department-assignments?user=${encodeURIComponent(String(userId))}&business=${encodeURIComponent(String(businessId))}${activeQuery}`);
   const data=await res.json();

   if(!res.ok)return [];

   return Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
  }catch(err){
   console.error("Department assignment load error",err);
   return [];
  }
 };

 const syncBusinessRoleAssignment=async(userId,roleId)=>{
  if(!userId||!businessId)return;

  const existingAssignment=await fetchBusinessRoleAssignment(userId,false);

  if(!roleId){
   if(existingAssignment?._id){
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
   isPrimary:true,
   isActive:true
  };

  const res=await fetch(existingAssignment?._id?`/api/users/role-assignments/${existingAssignment._id}`:"/api/users/role-assignments",{
   method:existingAssignment?._id?"PUT":"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify(payload)
  });

  const data=await res.json();

  if(!res.ok)
   throw new Error(getResponseError(data,"Failed to save role assignment"));
 };

 const syncBusinessDepartmentAssignment=async(userId,departmentId,roleOverrideId)=>{
  if(!userId||!businessId)return;

  const existingAssignments=await fetchBusinessDepartmentAssignments(userId,false);

  if(!departmentId){
   await Promise.all(existingAssignments.filter(item=>item?._id&&item.isActive!==false).map(item=>
    fetch(`/api/users/department-assignments/${item._id}`,{
     method:"PUT",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({isActive:false})
    }).then(async res=>{
     const data=await res.json();
     if(!res.ok)throw new Error(getResponseError(data,"Failed to update department assignment"));
    })
   ));

   return;
  }

  const existingAssignment=existingAssignments.find(item=>getObjectId(item.department)===departmentId);

  const payload={
   user:userId,
   business:businessId,
   department:departmentId,
   roleOverride:roleOverrideId||null,
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
   throw new Error(getResponseError(data,"Failed to save department assignment"));

  await Promise.all(existingAssignments.filter(item=>item?._id&&item._id!==existingAssignment?._id&&getObjectId(item.department)!==departmentId&&item.isActive!==false).map(item=>
   fetch(`/api/users/department-assignments/${item._id}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({isPrimary:false,isActive:false})
   }).then(async res=>{
    const data=await res.json();
    if(!res.ok)throw new Error(getResponseError(data,"Failed to update old department assignment"));
   })
  ));
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
   if(!user){
    setForm({
     username:"",
     email:"",
     password:"",
     businessRole:"",
     department:"",
     roleOverride:"",
     isActive:true,
     details:{...emptyDetails}
    });
    setDetailsId("");
    setActiveTab("account");
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarError("");
    setAvatarInputKey(prev=>prev+1);
    return;
   }

   const initialDepartmentAssignment=getPrimaryDepartmentAssignment(user.businessDepartmentAssignments);
   const initialDetails=user.details&&typeof user.details==="object"?normalizeDetails(user.details):{...emptyDetails};

   setForm({
    username:user.username||"",
    email:user.email||"",
    password:"",
    businessRole:getObjectId(user.businessRoleAssignment?.role),
    department:getObjectId(initialDepartmentAssignment?.department),
    roleOverride:getObjectId(initialDepartmentAssignment?.roleOverride),
    isActive:user.isActive!==undefined?user.isActive:true,
    details:initialDetails
   });

   setDetailsId(getObjectId(user.details));
   setAvatarFile(null);
   setAvatarPreview(initialDetails.avatar?getAvatarUrl(initialDetails.avatar):"");
   setAvatarError("");
   setAvatarInputKey(prev=>prev+1);

   try{
    const [roleAssignment,departmentAssignments,detailsRes]=await Promise.all([
     fetchBusinessRoleAssignment(user._id),
     fetchBusinessDepartmentAssignments(user._id),
     fetch(`/api/users/details?user=${encodeURIComponent(String(user._id))}`)
    ]);

    const primaryDepartmentAssignment=getPrimaryDepartmentAssignment(departmentAssignments);

    setForm(prev=>({
     ...prev,
     businessRole:getObjectId(roleAssignment?.role)||prev.businessRole,
     department:getObjectId(primaryDepartmentAssignment?.department)||prev.department,
     roleOverride:getObjectId(primaryDepartmentAssignment?.roleOverride)||prev.roleOverride
    }));

    const detailsData=await detailsRes.json();

    if(detailsRes.ok&&Array.isArray(detailsData?.data)&&detailsData.data.length>0){
     const associatedDetails=detailsData.data[0];
     const normalizedDetails=normalizeDetails(associatedDetails);

     setDetailsId(associatedDetails._id||"");

     setForm(prev=>({
      ...prev,
      details:normalizedDetails
     }));

     setAvatarPreview(normalizedDetails.avatar?getAvatarUrl(normalizedDetails.avatar):"");
    }
   }catch(err){
    console.error("Associated user load error",err);
   }
  };

  loadUserForm();
 },[user,businessId]);

 useEffect(()=>{
  if(!avatarFile)return;

  const objectUrl=URL.createObjectURL(avatarFile);
  setAvatarPreview(objectUrl);

  return()=>{
   URL.revokeObjectURL(objectUrl);
  };
 },[avatarFile]);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;

  setForm(prev=>{
   const next={
    ...prev,
    [name]:type==="checkbox"?checked:value
   };

   if(name==="department"&&!value)
    next.roleOverride="";

   return next;
  });
 };

 const handleDetailsChange=e=>{
  const {name,value}=e.target;

  setForm(prev=>({
   ...prev,
   details:{
    ...prev.details,
    [name]:value
   }
  }));
 };

 const handlePhoneChange=value=>{
  setForm(prev=>({
   ...prev,
   details:{
    ...prev.details,
    phone:value
   }
  }));
 };

 const handleCellChange=value=>{
  setForm(prev=>({
   ...prev,
   details:{
    ...prev.details,
    cell:value
   }
  }));
 };

 const uploadAvatarFile=async file=>{
  if(!file)return "";

  setAvatarUploading(true);
  setAvatarError("");

  try{
   const formData=new FormData();
   formData.append("file",file);

   const res=await fetch("/api/upload/avatars",{
    method:"POST",
    body:formData
   });

   const data=await res.json();

   if(!res.ok)
    throw new Error(data?.message||"Failed to upload avatar");

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
  }catch(err){
   console.error("Avatar upload error",err);
   setAvatarError(err.message||"Failed to upload avatar");
   throw err;
  }finally{
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

 const handleAvatarFileChange=async e=>{
  const file=e.target.files&&e.target.files[0]?e.target.files[0]:null;
  setAvatarFile(file);
  setAvatarError("");

  if(!file&&form.details.avatar)
   setAvatarPreview(getAvatarUrl(form.details.avatar));

  if(!file&&!form.details.avatar)
   setAvatarPreview("");

  if(file)
   await uploadAvatarFile(file);
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

 const handleRemoveNote=index=>{
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

 const handleClear=()=>{
  setForm({
   username:"",
   email:"",
   password:"",
   businessRole:"",
   department:"",
   roleOverride:"",
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

 const saveUserDetails=async(userId,existingDetailsId,cleanDetails)=>{
  const res=await fetch(existingDetailsId?`/api/users/details/${existingDetailsId}`:"/api/users/details",{
   method:existingDetailsId?"PUT":"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({
    user:userId,
    ...cleanDetails
   })
  });

  const data=await res.json();

  if(!res.ok)
   throw new Error(data?.message||"Failed to save user details");

  return data?.data||data?.userDetails||data;
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  setSaving(true);
  setError("");

  try{
   if(!businessId)
    throw new Error("No current business is selected for this user.");

   if(!form.businessRole)
    throw new Error("Business role is required.");

   const cleanDetails={
    ...form.details,
    notes:(Array.isArray(form.details.notes)?form.details.notes:[]).map(note=>String(note||"").trim()).filter(Boolean)
   };

   let finalUser=null;
   let userId=getObjectId(user);

   if(user){
    const payload={
     username:form.username,
     email:form.email,
     isActive:form.isActive,
     details:detailsId||null
    };

    if(form.password.trim())
     payload.password=form.password;

    const userRes=await fetch(`/api/users/${userId}`,{
     method:"PUT",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify(payload)
    });

    const userData=await userRes.json();

    if(!userRes.ok)
     throw new Error(userData?.message||"Failed to save user");

    finalUser=userData.data||userData.user||userData;
   }
   else{
    const createUserRes=await fetch("/api/users",{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({
      username:form.username,
      email:form.email,
      password:form.password,
      isActive:form.isActive
     })
    });

    const createUserData=await createUserRes.json();

    if(!createUserRes.ok)
     throw new Error(createUserData?.message||"Failed to create user");

    finalUser=createUserData.data||createUserData.user||createUserData;
    userId=getObjectId(finalUser);

    if(!userId)
     throw new Error("Created user id not returned");
   }

   const savedDetails=await saveUserDetails(userId,detailsId||getObjectId(finalUser.details),cleanDetails);
   const savedDetailsId=getObjectId(savedDetails);

   if(savedDetailsId){
    setDetailsId(savedDetailsId);

    const linkUserRes=await fetch(`/api/users/${userId}`,{
     method:"PUT",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({details:savedDetailsId})
    });

    const linkUserData=await linkUserRes.json();

    if(!linkUserRes.ok)
     throw new Error(linkUserData?.message||"Failed to link user details");

    finalUser=linkUserData.data||linkUserData.user||linkUserData;
   }

   await syncBusinessRoleAssignment(userId,form.businessRole);
   await syncBusinessDepartmentAssignment(userId,form.department||null,form.department?form.roleOverride||null:null);

   if(onSuccess)
    onSuccess(finalUser);
  }catch(err){
   console.error("User save error",err);
   setError(err.message||"Failed to save user");
  }finally{
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

      <Col md={6}>
       <Form.Group>
        <Form.Label>Business Role</Form.Label>
        <Form.Select name="businessRole" value={form.businessRole} onChange={handleChange} required>
         <option value="">Select Business Role</option>
         {roles.map(role=>(
          <option key={getObjectId(role)} value={getObjectId(role)}>
           {role.label||role.name}
          </option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>

     <Row className="mb-3">
      <Col md={6}>
       <Form.Group>
        <Form.Label>Department</Form.Label>
        <Form.Select name="department" value={form.department} onChange={handleChange}>
         <option value="">No Department</option>
         {departments.map(department=>(
          <option key={getObjectId(department)} value={getObjectId(department)}>
           {department.name}
          </option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group>
        <Form.Label>Department Role Override</Form.Label>
        <Form.Select name="roleOverride" value={form.roleOverride} onChange={handleChange} disabled={!form.department}>
         <option value="">Use Department Default</option>
         {roles.map(role=>(
          <option key={getObjectId(role)} value={getObjectId(role)}>
           {role.label||role.name}
          </option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>

     <Row className="mb-3">
      <Col md={12}>
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
    <Button type="submit" disabled={saving||avatarUploading}>
     {saving?"Saving...":user?"Update User":"Create User"}
    </Button>

    {!user?(
     <Button type="button" variant="outline-secondary" onClick={handleClear} disabled={saving||avatarUploading}>
      Clear
     </Button>
    ):null}
   </div>
  </Form>
 );
}