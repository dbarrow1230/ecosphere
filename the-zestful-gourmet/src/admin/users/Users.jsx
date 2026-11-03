import {useEffect,useState} from "react";
import {Table,Spinner,Alert,Button,Modal,ButtonGroup} from "react-bootstrap";
import UserForm from "../../forms/users/UserForm";
import AdminCatalogWorkspace from "../../components/AdminCatalogWorkspace.jsx";

function Users()
{
 const [users,setUsers]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [currentUser,setCurrentUser]=useState(null);
 const [showDelete,setShowDelete]=useState(false);
 const [userToDelete,setUserToDelete]=useState(null);
 const [showDetails,setShowDetails]=useState(false);
 const [detailUser,setDetailUser]=useState(null);
 const [detailPermissions,setDetailPermissions]=useState([]);
 const [loadingDetails,setLoadingDetails]=useState(false);
 const [alert,setAlert]=useState(null);
 const [currentBusinessId,setCurrentBusinessId]=useState("");
 const [businessRoles,setBusinessRoles]=useState([]);
 const [selectedId,setSelectedId]=useState("");
 const [locationNames,setLocationNames]=useState({states:new Map(),counties:new Map(),countries:new Map()});

 const adminRoleId="69d389f609a4ebea1c3f634e";
 const adminUserId="69af088d21b4580a8cb6614b";
 const ownerRoleNames=["owner","business owner","app owner","super admin"];
 const adminRoleNames=["admin","administrator"];

 const isValidObjectId=value=>{
  return typeof value==="string"&&/^[a-f\d]{24}$/i.test(value);
 };

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

 const unwrapBusiness=data=>{
  if(!data||typeof data!=="object")return null;
  if(data?.business&&typeof data.business==="object")return data.business;
  if(data?.data&&typeof data.data==="object"&&!Array.isArray(data.data))return data.data;
  return data;
 };

 const getRuntimeAppKey=()=>{
  const envKey=String(import.meta.env?.VITE_APP_KEY||"").trim().toLowerCase();
  if(envKey)return envKey;

  const configKey=String(window?.APP_CONFIG?.APP_KEY||"").trim().toLowerCase();
  if(configKey)return configKey;

  const meta=document.querySelector('meta[name="app-key"]');
  return String(meta?.getAttribute("content")||"").trim().toLowerCase();
 };

 const loadCurrentAppBusinessId=async()=>{
  const appKey=getRuntimeAppKey();
  if(!appKey)return "";

  const res=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`,{
   cache:"no-store",
   headers:{
    "Cache-Control":"no-cache",
    "Pragma":"no-cache"
   }
  });

  if(!res.ok)return "";

  const data=await res.json().catch(()=>null);
  return getObjectId(unwrapBusiness(data));
 };

 const normalizeStoredUser=value=>{
  if(!value||typeof value!=="object")
  {
   return null;
  }

  const userId=getObjectId(value);
  const roleId=getObjectId(value.role);

  if(!isValidObjectId(userId))
  {
   return null;
  }

  return{
   ...value,
   _id:userId,
   id:userId,
   role:value.role||null,
   roleId:roleId
  };
 };

 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys)
  {
   try
   {
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);

    if(!raw)
    {
     continue;
    }

    const parsed=JSON.parse(raw);

    const directUser=normalizeStoredUser(parsed);
    if(directUser)
    {
     return directUser;
    }

    const nestedUser=normalizeStoredUser(parsed?.user);
    if(nestedUser)
    {
     return nestedUser;
    }

    const dataUser=normalizeStoredUser(parsed?.data);
    if(dataUser)
    {
     return dataUser;
    }
   }
   catch(err)
   {
    console.error(`Failed to parse localStorage key: ${key}`,err);
   }
  }

  return null;
 };

 const getRoleId=role=>{
  const roleId=getObjectId(role);
  return isValidObjectId(roleId)?roleId:"";
 };

 const getRoleName=role=>{
  if(!role)
  {
   return "";
  }

  if(typeof role==="string")
  {
   const matchedRole=businessRoles.find(item=>getObjectId(item)===role);
   return matchedRole?String(matchedRole.name||matchedRole.roleName||matchedRole.title||"").toLowerCase():"";
  }

  if(typeof role==="object")
  {
   return String(role.name||role.roleName||role.title||"").toLowerCase();
  }

  return "";
 };

 const getAssignedRole=user=>{
  return user?.businessRoleAssignment?.role||
   user?.businessDepartmentAssignment?.role||
   user?.businessDepartmentAssignment?.department?.defaultRole||
   user?.role||
   null;
 };

 const getDepartmentAssignments=user=>{
  if(Array.isArray(user?.businessDepartmentAssignments))return user.businessDepartmentAssignments;
  return user?.businessDepartmentAssignment?[user.businessDepartmentAssignment]:[];
 };

 const hasPersonalDetails=user=>{
  const details=getDetails(user);
  return [details.firstName,details.lastName,details.phone,details.cell,details.address1,details.address2,details.city,details.postalCode,details.state,details.county,details.country]
   .some(Boolean);
 };

 const getEmergencyContacts=user=>{
  const contacts=getDetails(user).emergencyContacts;
  return Array.isArray(contacts)?contacts:[];
 };

 const getAssignedRoleName=user=>{
  const role=getAssignedRole(user);
  const roleName=getRoleName(role);

  if(roleName)
  {
   return roleName;
  }

  const roleId=getObjectId(role);
  const matchedRole=businessRoles.find(item=>getObjectId(item)===roleId);
  return matchedRole?String(matchedRole.name||matchedRole.roleName||matchedRole.title||"").toLowerCase():"";
 };

 const formatRoleName=role=>{
  const roleName=getRoleName(role);
  return roleName||"-";
 };

 const getRoleSource=user=>{
  if(user?.businessRoleAssignment?.role)return "Direct role assignment";
  if(user?.businessDepartmentAssignment?.role)return "Department role override";
  if(user?.businessDepartmentAssignment?.department?.defaultRole)return "Department default role";
  if(user?.role)return "User profile role";
  return "No role assignment";
 };

 const formatDate=value=>{
  return value?new Date(value).toLocaleString():"-";
 };

 const getDetails=user=>user?.details&&typeof user.details==="object"?user.details:{};

 const getFullName=user=>{
  const details=getDetails(user);
  return [details.firstName,details.lastName].map(value=>String(value||"").trim()).filter(Boolean).join(" ");
 };

 const getLocationRecord=(value,type)=>{
  if(!value)return null;
  if(typeof value==="object")
  {
   const storedRecord=locationNames[type]?.get(getObjectId(value));
   return storedRecord?{...storedRecord,...value}:value;
  }
  return locationNames[type]?.get(value)||null;
 };

 const getLocationName=(value,type)=>{
  if(!value)return "-";
  const record=getLocationRecord(value,type)||locationNames[type]?.get(getObjectId(value));
  return record?.name||record?.abbreviation||"-";
 };

 const formatPhoneNumber=(value,user)=>{
  const digits=String(value||"").replace(/\D/g,"");
  if(!digits)return "-";

  const country=getLocationRecord(getDetails(user).country,"countries");
  const iso2=String(country?.iso2||"").toUpperCase();
  const callingCode=String(country?.phoneCode||"").replace(/\D/g,"");
  let nationalNumber=digits;

  if(callingCode&&digits.startsWith(callingCode)&&digits.length>callingCode.length+6)
  {
   nationalNumber=digits.slice(callingCode.length);
  }

  if((iso2==="US"||iso2==="CA")&&nationalNumber.length===10)
  {
   return `+1 (${nationalNumber.slice(0,3)}) ${nationalNumber.slice(3,6)}-${nationalNumber.slice(6)}`;
  }

  if(iso2==="GB"&&nationalNumber.length===10)
  {
   return `+44 ${nationalNumber.slice(0,4)} ${nationalNumber.slice(4,7)} ${nationalNumber.slice(7)}`;
  }

  if(iso2==="AU"&&nationalNumber.length===9)
  {
   return `+61 ${nationalNumber.slice(0,3)} ${nationalNumber.slice(3,6)} ${nationalNumber.slice(6)}`;
  }

  const groups=[];
  let remaining=nationalNumber;
  while(remaining.length>4)
  {
   groups.push(remaining.slice(0,3));
   remaining=remaining.slice(3);
  }
  if(remaining)groups.push(remaining);

  return `${callingCode?`+${callingCode} `:""}${groups.join(" ")}`.trim();
 };

 const fetchLocationNames=async()=>{
  try
  {
   const endpoints={states:"/api/states",counties:"/api/counties",countries:"/api/countries"};
   const entries=await Promise.all(Object.entries(endpoints).map(async([type,url])=>{
    const res=await fetch(url);
    const data=await res.json();
    const records=Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
    return [type,new Map(records.map(record=>[getObjectId(record),record]))];
   }));
   setLocationNames(Object.fromEntries(entries));
  }
  catch(err)
  {
   console.error("Location name load error",err);
  }
 };

 const isAdminUser=user=>{
  if(!user)
  {
   return false;
  }

  const userId=getObjectId(user);
  const roleId=getRoleId(user.role)||user.roleId||"";
  const roleName=getRoleName(user.role);

  const assignedRoleName=getAssignedRoleName(user);

  return userId===adminUserId||
   roleId===adminRoleId||
   adminRoleNames.includes(roleName)||
   ownerRoleNames.includes(roleName)||
   adminRoleNames.includes(assignedRoleName)||
   ownerRoleNames.includes(assignedRoleName);
 };

 const getRoleBadgeClass=role=>{
  const roleName=getRoleName(role);

  if(roleName==="admin")
  {
   return "is-danger";
  }

  if(roleName==="manager")
  {
   return "is-warning";
  }

  if(roleName==="staff")
  {
   return "is-info";
  }

  if(roleName==="editor")
  {
   return "is-primary";
  }

  if(roleName==="viewer")
  {
   return "is-secondary";
  }

  if(roleName==="user")
  {
   return "is-success";
  }

  return "is-secondary";
 };

 const normalizeUsersResponse=data=>{
  if(Array.isArray(data))
  {
   return data;
  }

  if(Array.isArray(data?.users))
  {
   return data.users;
  }

  if(Array.isArray(data?.data))
  {
   return data.data;
  }

  return [];
 };

 const fetchUsers=async businessId=>{
  try
  {
   const loadUsers=async url=>{
    const res=await fetch(url);
    const data=await res.json();

    if(!res.ok)
    {
     throw new Error(data?.message||"Failed to load users");
    }

    return normalizeUsersResponse(data);
   };

   const scopedUsers=businessId?await loadUsers(`/api/users?business=${encodeURIComponent(String(businessId))}`):[];
   let nextUsers=scopedUsers.length?scopedUsers:await loadUsers("/api/users");

   if(businessId&&nextUsers.length)
   {
    const assignmentRes=await fetch(`/api/users/department-assignments?business=${encodeURIComponent(String(businessId))}&isActive=true`);
    const assignmentData=await assignmentRes.json();

    if(assignmentRes.ok)
    {
     const assignments=Array.isArray(assignmentData?.data)?assignmentData.data:[];
     const assignmentsByUser=assignments.reduce((map,assignment)=>{
      const userId=getObjectId(assignment.user);
      if(!userId)return map;
      const current=map.get(userId)||[];
      current.push(assignment);
      map.set(userId,current);
      return map;
     },new Map());

     nextUsers=nextUsers.map(user=>({
      ...user,
      businessDepartmentAssignments:assignmentsByUser.get(getObjectId(user))||[]
     }));
    }
   }

   setUsers(nextUsers);
   setSelectedId(current=>nextUsers.some(user=>getObjectId(user)===current)?current:getObjectId(nextUsers[0]));
  }
  catch(err)
  {
   setError(err.message||"Failed to load users");
   setUsers([]);
  }
  finally
  {
   setLoading(false);
  }
 };

 const fetchBusinessRoles=async businessId=>{
  if(!businessId)
  {
   setBusinessRoles([]);
   return;
  }

  try
  {
   const res=await fetch(`/api/users/roles?business=${encodeURIComponent(String(businessId))}`);
   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to load roles");
   }

   if(Array.isArray(data.data))
   {
    setBusinessRoles(data.data);
   }
   else if(Array.isArray(data.roles))
   {
    setBusinessRoles(data.roles);
   }
   else if(Array.isArray(data))
   {
    setBusinessRoles(data);
   }
   else
   {
    setBusinessRoles([]);
   }
  }
  catch(err)
  {
   console.error("Role load error",err);
   setBusinessRoles([]);
  }
 };

 useEffect(()=>{
  const initializePage=async()=>{
   const parsedUser=getStoredUser();

   if(!parsedUser)
   {
    setError("You must be logged in to view this page.");
    setLoading(false);
    return;
   }

   if(!isAdminUser(parsedUser))
   {
    setError("You do not have permission to view this page.");
    setLoading(false);
    return;
   }

   const businessId=await loadCurrentAppBusinessId();
   setCurrentBusinessId(businessId);
   await Promise.all([fetchBusinessRoles(businessId),fetchLocationNames()]);
   await fetchUsers(businessId);
  };

  initializePage();
 },[]);

 const showTimedAlert=(variant,message)=>{
  setAlert({variant,message});
  setTimeout(()=>{setAlert(null);},5000);
 };

 const handleAdd=()=>{
  setCurrentUser(null);
  setShowForm(true);
 };

 const handleEdit=user=>{
  setCurrentUser(user);
  setShowForm(true);
 };

 const handleDeleteConfirm=user=>{
  setUserToDelete(user);
  setShowDelete(true);
 };

 const fetchEffectivePermissions=async user=>{
  if(!user?._id||!currentBusinessId)
  {
   setDetailPermissions([]);
   return;
  }

  const res=await fetch(`/api/users/effective-permissions?user=${encodeURIComponent(String(user._id))}&business=${encodeURIComponent(String(currentBusinessId))}`);
  const data=await res.json().catch(()=>null);

  if(!res.ok)
  {
   throw new Error(data?.message||"Failed to load effective permissions");
  }

  setDetailPermissions(Array.isArray(data?.data)?data.data:[]);
 };

 const handleShowDetails=async user=>{
  setDetailUser(user);
  setDetailPermissions([]);
  setShowDetails(true);

  try
  {
   setLoadingDetails(true);
   await fetchEffectivePermissions(user);
  }
  catch(err)
  {
   showTimedAlert("danger",err.message||"Failed to load user permissions");
  }
  finally
  {
   setLoadingDetails(false);
  }
 };

 const closeDetails=()=>{
  setShowDetails(false);
  setDetailUser(null);
  setDetailPermissions([]);
 };

 const handleDelete=async()=>{
  if(!userToDelete)
  {
   return;
  }

  try
  {
   const res=await fetch(`/api/users/${userToDelete._id}`,{method:"DELETE"});
   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Delete failed");
   }

   setUsers(prev=>prev.filter(user=>user._id!==userToDelete._id));
   showTimedAlert("success","User deleted");
  }
  catch(err)
  {
   showTimedAlert("danger",err.message||"Delete failed");
  }
  finally
  {
   setShowDelete(false);
   setUserToDelete(null);
  }
 };

 const handleFormSuccess=async()=>{
  setShowForm(false);
  await fetchBusinessRoles(currentBusinessId);
  await fetchUsers(currentBusinessId);
  showTimedAlert("success","User saved");
 };

 if(loading)
 {
  return(
   <main className="admin-users-page text-center"><Spinner animation="border"/></main>
  );
 }

 const selectedUser=users.find(user=>getObjectId(user)===selectedId)||null;

 return(
  <main className="admin-users-page">

   {alert&&<Alert variant={alert.variant}>{alert.message}</Alert>}
   {error&&<Alert variant="danger">{error}</Alert>}

   {!error?<AdminCatalogWorkspace title="Users" description="Manage user accounts, business roles, departments, and effective permissions."
    records={users} selectedId={selectedId} onSelect={setSelectedId} onAdd={handleAdd} addLabel="Add User" emptyMessage="No users found."
    searchPlaceholder="Search users..." getId={getObjectId} getName={user=>getFullName(user)||user.username||user.email||"Unnamed user"} getCode={user=>user.username?`@${user.username}`:user.email||"NO USERNAME"}
    getDescription={user=>user.email||getAssignedRoleName(user)||"No assigned role"} isActive={user=>user.isActive}
    actions={selectedUser?<ButtonGroup size="sm"><Button variant="outline-primary" onClick={()=>handleShowDetails(selectedUser)}>View</Button><Button variant="outline-warning" onClick={()=>handleEdit(selectedUser)}>Edit</Button><Button variant="outline-danger" onClick={()=>handleDeleteConfirm(selectedUser)}>Delete</Button></ButtonGroup>:null}>
    {selectedUser?<div className="admin-user-summary">
     <h2>{getFullName(selectedUser)||selectedUser.username||"User"}</h2>
     <p className="text-muted">{selectedUser.username?`@${selectedUser.username}`:"No username"} · {selectedUser.email||"No email address."}</p>

     <section>
      <h3>Account</h3>
      <dl className="detail-field-list detail-fields">
       <div><dt>Username</dt><dd>{selectedUser.username||"-"}</dd></div>
       <div><dt>Email</dt><dd>{selectedUser.email||"-"}</dd></div>
       <div><dt>Status</dt><dd><span className={`admin-user-token-badge ${selectedUser.isActive?"is-success":"is-secondary"}`}>{selectedUser.isActive?"Active":"Inactive"}</span></dd></div>
       <div><dt>Last login</dt><dd>{formatDate(selectedUser.lastLogin)}</dd></div>
       <div><dt>Effective role</dt><dd><span className={`admin-user-token-badge ${getRoleBadgeClass(getAssignedRole(selectedUser))}`}>{getAssignedRoleName(selectedUser)||"-"}</span></dd></div>
       <div><dt>Role source</dt><dd>{getRoleSource(selectedUser)}</dd></div>
      </dl>
     </section>

     {hasPersonalDetails(selectedUser)?<section>
      <h3>Contact details</h3>
      <div className="admin-user-contact-details detail-fields">
       <div className="admin-user-contact-row detail-field-row is-two-column">
        <div><span>First name</span><strong>{getDetails(selectedUser).firstName||"-"}</strong></div>
        <div><span>Last name</span><strong>{getDetails(selectedUser).lastName||"-"}</strong></div>
       </div>
       <div className="admin-user-contact-row detail-field-row is-two-column">
        <div><span>Phone</span><strong>{formatPhoneNumber(getDetails(selectedUser).phone,selectedUser)}</strong></div>
        <div><span>Cell</span><strong>{formatPhoneNumber(getDetails(selectedUser).cell,selectedUser)}</strong></div>
       </div>
       <div className="admin-user-contact-row detail-field-row is-full-row"><div><span>Address 1</span><strong>{getDetails(selectedUser).address1||"-"}</strong></div></div>
       <div className="admin-user-contact-row detail-field-row is-full-row"><div><span>Address 2</span><strong>{getDetails(selectedUser).address2||"-"}</strong></div></div>
       <div className="admin-user-contact-row detail-field-row is-location-row">
        <div><span>City</span><strong>{getDetails(selectedUser).city||"-"}</strong></div>
        <div><span>State</span><strong>{getLocationName(getDetails(selectedUser).state,"states")}</strong></div>
        <div><span>Country</span><strong>{getLocationName(getDetails(selectedUser).country,"countries")}</strong></div>
        <div><span>Postal Code</span><strong>{getDetails(selectedUser).postalCode||"-"}</strong></div>
       </div>
       <div className="admin-user-contact-row detail-field-row is-full-row"><div><span>County</span><strong>{getLocationName(getDetails(selectedUser).county,"counties")}</strong></div></div>
      </div>
     </section>:null}

     {getEmergencyContacts(selectedUser).length?<section>
      <h3>Emergency contacts</h3>
      <div className="admin-user-emergency-list detail-fields">
       {getEmergencyContacts(selectedUser).map((contact,index)=><div className="admin-user-emergency-display-row detail-field-row" key={contact._id||index}>
        <div><span>Contact name</span><strong>{contact.name||"-"}</strong></div>
        <div><span>Phone</span><strong>{formatPhoneNumber(contact.phone,selectedUser)}</strong></div>
        <div><span>Relationship</span><strong>{contact.relationship||"-"}</strong></div>
       </div>)}
      </div>
     </section>:null}

     <section>
      <h3>Departments</h3>
      <div className="admin-user-department-list">
       {getDepartmentAssignments(selectedUser).length?getDepartmentAssignments(selectedUser).map(assignment=><div key={getObjectId(assignment)||getObjectId(assignment.department)}>
        <strong>{assignment.department?.name||"Unnamed department"}</strong>
        {assignment.department?.code?<span>{assignment.department.code}</span>:null}
        <span>{formatRoleName(assignment.role||assignment.department?.defaultRole)}</span>
        {assignment.isPrimary?<span>Primary</span>:null}
       </div>):<p>No departments assigned.</p>}
      </div>
     </section>
    </div>:null}
   </AdminCatalogWorkspace>:null}

   <Modal show={showForm} onHide={()=>setShowForm(false)} size="xl" centered scrollable backdrop="static">
    <Modal.Header closeButton><Modal.Title>{currentUser?"Edit User":"Add User"}</Modal.Title></Modal.Header>
    <Modal.Body className="px-4 py-4"><UserForm user={currentUser} businessId={currentBusinessId} onSuccess={handleFormSuccess}/></Modal.Body>
   </Modal>

   <Modal show={showDetails} onHide={closeDetails} size="xl" centered scrollable>
    <Modal.Header closeButton>
     <Modal.Title>User Details</Modal.Title>
    </Modal.Header>
    <Modal.Body className="px-4 py-4">
     {detailUser?(
      <div className="admin-user-detail">
       <section className="admin-user-detail-section">
        <h4>{getFullName(detailUser)||detailUser.username||"User"}</h4>
        <Table responsive bordered className="mb-0">
         <tbody>
          <tr>
           <th>First Name</th>
           <td>{getDetails(detailUser).firstName||"-"}</td>
           <th>Last Name</th>
           <td>{getDetails(detailUser).lastName||"-"}</td>
          </tr>
          <tr>
           <th>Username</th>
           <td>{detailUser.username||"-"}</td>
           <th>Email</th>
           <td>{detailUser.email||"-"}</td>
          </tr>
          {getDetails(detailUser).phone||getDetails(detailUser).cell?<tr>
           <th>Phone</th>
           <td>{formatPhoneNumber(getDetails(detailUser).phone,detailUser)}</td>
           <th>Cell</th>
           <td>{formatPhoneNumber(getDetails(detailUser).cell,detailUser)}</td>
          </tr>:null}
          {getDetails(detailUser).address1?<tr>
           <th>Address 1</th>
           <td colSpan="3">{getDetails(detailUser).address1}</td>
          </tr>:null}
          {getDetails(detailUser).address2?<tr>
           <th>Address 2</th>
           <td colSpan="3">{getDetails(detailUser).address2}</td>
          </tr>:null}
          {getDetails(detailUser).city||getLocationName(getDetails(detailUser).state,"states")!=="-"?<tr>
           <th>City</th>
           <td>{getDetails(detailUser).city||"-"}</td>
           <th>State</th>
           <td>{getLocationName(getDetails(detailUser).state,"states")}</td>
          </tr>:null}
          {getDetails(detailUser).postalCode||getLocationName(getDetails(detailUser).county,"counties")!=="-"?<tr>
           <th>Postal Code</th>
           <td>{getDetails(detailUser).postalCode||"-"}</td>
           <th>County</th>
           <td>{getLocationName(getDetails(detailUser).county,"counties")}</td>
          </tr>:null}
          {getLocationName(getDetails(detailUser).country,"countries")!=="-"?<tr>
           <th>Country</th>
           <td colSpan="3">{getLocationName(getDetails(detailUser).country,"countries")}</td>
          </tr>:null}
          {getEmergencyContacts(detailUser).map((contact,index)=><tr key={contact._id||index}>
           <th>Emergency Contact</th>
           <td>{contact.name||"-"}</td>
           <th>{contact.relationship||"Relationship"}</th>
           <td>{formatPhoneNumber(contact.phone,detailUser)}</td>
          </tr>)}
          <tr>
           <th>Status</th>
           <td><span className={`admin-user-token-badge ${detailUser.isActive?"is-success":"is-secondary"}`}>{detailUser.isActive?"Active":"Inactive"}</span></td>
           <th>Last Login</th>
           <td>{formatDate(detailUser.lastLogin)}</td>
          </tr>
          <tr>
           <th>Role Source</th>
           <td>{getRoleSource(detailUser)}</td>
           <th>Effective Role</th>
           <td>
            <span className={`admin-user-token-badge ${getRoleBadgeClass(getAssignedRole(detailUser))}`}>
             {getAssignedRoleName(detailUser)||"-"}
            </span>
           </td>
          </tr>
          {getDepartmentAssignments(detailUser).map(assignment=><tr key={getObjectId(assignment)||getObjectId(assignment.department)}>
           <th>Department</th>
           <td>{assignment.department?.name||"Unnamed department"}{assignment.department?.code?` (${assignment.department.code})`:""}</td>
           <th>Department Role</th>
           <td>{formatRoleName(assignment.role||assignment.department?.defaultRole)}{assignment.isPrimary?" · Primary":""}</td>
          </tr>)}
          {!getDepartmentAssignments(detailUser).length?<tr>
           <th>Department</th>
           <td colSpan="3">No departments assigned.</td>
          </tr>:null}
         </tbody>
        </Table>
       </section>

       <section className="admin-user-detail-section">
        <div className="d-flex justify-content-between align-items-center mb-2">
         <h4 className="mb-0">Effective Permissions</h4>
         {loadingDetails?<Spinner size="sm" animation="border"/>:null}
        </div>

        <Table responsive bordered hover className="mb-0 align-middle">
         <thead>
          <tr>
           <th>Module</th>
           <th>Create</th>
           <th>Read</th>
           <th>Update</th>
           <th>Delete</th>
           <th>Admin</th>
          </tr>
         </thead>
         <tbody>
          {!loadingDetails&&detailPermissions.length===0?(
           <tr>
            <td colSpan="6" className="text-center text-muted">No effective permissions found.</td>
           </tr>
          ):null}

          {detailPermissions.map(permission=>(
           <tr key={permission.module}>
            <td>{permission.module}</td>
            <td>{permission.create?"Yes":"-"}</td>
            <td>{permission.read?"Yes":"-"}</td>
            <td>{permission.update?"Yes":"-"}</td>
            <td>{permission.delete?"Yes":"-"}</td>
            <td>{permission.admin?"Yes":"-"}</td>
           </tr>
          ))}
         </tbody>
        </Table>
       </section>
      </div>
     ):null}
    </Modal.Body>
    <Modal.Footer>
     <Button variant="outline-warning" onClick={()=>{
      const user=detailUser;
      closeDetails();
      handleEdit(user);
     }} disabled={!detailUser}>Edit User</Button>
     <Button variant="secondary" onClick={closeDetails}>Close</Button>
    </Modal.Footer>
   </Modal>

   <Modal show={showDelete} onHide={()=>setShowDelete(false)} centered>
    <Modal.Header closeButton><Modal.Title>Delete User</Modal.Title></Modal.Header>
    <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setShowDelete(false)}>Cancel</Button>
     <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </Modal.Footer>
   </Modal>

  </main>
 );
}

export default Users;
