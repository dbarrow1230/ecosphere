import {useEffect,useState} from "react";
import {Container,Row,Col,Card,Spinner,Alert,Image,ListGroup,Badge} from "react-bootstrap";
import "../../../styles/UserProfilePage.css";




export default function UserProfilePage()
{
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [profile,setProfile]=useState(null);
 const [details,setDetails]=useState(null);
 const [roleAssignment,setRoleAssignment]=useState(null);

 const getId=value=>{
  if(!value)return "";

  if(typeof value==="string")return value;

  if(typeof value==="object")
  {
   if(typeof value._id?.$oid==="string")return value._id.$oid;
   if(typeof value._id==="string")return value._id;
   if(typeof value.id?.$oid==="string")return value.id.$oid;
   if(typeof value.id==="string")return value.id;
   if(typeof value.userId?.$oid==="string")return value.userId.$oid;
   if(typeof value.userId==="string")return value.userId;
   if(typeof value.$oid==="string")return value.$oid;
  }

  return "";
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

    if(getId(parsed))
    {
     return parsed;
    }

    if(getId(parsed?.user))
    {
     return parsed.user;
    }

    if(getId(parsed?.data))
    {
     return parsed.data;
    }

    if(getId(parsed?.data?.user))
    {
     return parsed.data.user;
    }

    if(getId(parsed?.profile))
    {
     return parsed.profile;
    }

    if(getId(parsed?.authUser))
    {
     return parsed.authUser;
    }
   }
   catch(err)
   {
    console.error(`Failed to parse storage key: ${key}`,err);
   }
  }

  return null;
 };

 const getUserId=user=>{
  return getId(user)||getId(user?.user)||getId(user?.data)||getId(user?.profile)||getId(user?.authUser);
 };

 const isObjectIdString=value=>{
  return typeof value==="string"&&/^[a-f\d]{24}$/i.test(value);
 };

 const formatDate=value=>{
  if(!value)
  {
   return "—";
  }

  const date=new Date(value);

  if(Number.isNaN(date.getTime()))
  {
   return "—";
  }

  return date.toLocaleString();
 };

 const getAvatarUrl=()=>{
  if(!details?.avatar)
  {
   return "";
  }

  if(details.avatar.startsWith("http://")||details.avatar.startsWith("https://")||details.avatar.startsWith("/"))
  {
   return details.avatar;
  }

  return `/avatars/${details.avatar}`;
 };

 const formatPhone=(value,country)=>{
  if(!value)
  {
   return "—";
  }

  const digits=String(value).replace(/\D/g,"");
  const normalizedCountry=String(country?.iso2||country?.name||country||"").trim().toLowerCase();

  if(normalizedCountry==="us"||normalizedCountry==="usa"||normalizedCountry==="united states"||normalizedCountry==="united states of america")
  {
   if(digits.length===10)
   {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
   }

   if(digits.length===11&&digits.startsWith("1"))
   {
    return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
   }
  }

  if(digits.length>10)
  {
   return `+${digits}`;
  }

  return value;
 };

 const getRoleName=role=>{
  if(!role)
  {
   return "";
  }

  if(typeof role==="object")
  {
   return role.name||role.roleName||role.label||"";
  }

  if(typeof role==="string")
  {
   if(isObjectIdString(role))
   {
    return "";
   }

   return role;
  }

  return "";
 };

 const getDisplayRole=()=>{
  const assignmentRole=getRoleName(roleAssignment?.role);

  if(assignmentRole)
  {
   return assignmentRole;
  }

  const assignedRoleName=getRoleName(roleAssignment?.roleName);

  if(assignedRoleName)
  {
   return assignedRoleName;
  }

  const profileRole=getRoleName(profile?.role);

  if(profileRole)
  {
   return profileRole;
  }

  return "";
 };

 const getRoleBadgeVariant=role=>{
  const roleName=String(role||"").toLowerCase();

  if(roleName==="owner")
  {
   return "dark";
  }

  if(roleName==="admin")
  {
   return "danger";
  }

  if(roleName==="manager")
  {
   return "warning";
  }

  if(roleName==="staff")
  {
   return "info";
  }

  if(roleName==="editor")
  {
   return "primary";
  }

  if(roleName==="viewer")
  {
   return "secondary";
  }

  return "secondary";
 };

 useEffect(()=>{
  let active=true;
  const loadProfile=async()=>{
   setLoading(true);
   setError("");
   try{
    const storedUser=getStoredUser();
    let token=localStorage.getItem("token")||sessionStorage.getItem("token")||storedUser?.token||"";
    try{token=JSON.parse(token);}catch{/* Tokens may be stored without JSON encoding. */}
    const options={credentials:"include",cache:"no-store",headers:typeof token==="string"&&token?{Authorization:"Bearer "+token}:{}};
    const appKey=String(import.meta.env.VITE_APP_KEY||window.APP_CONFIG?.APP_KEY||document.querySelector('meta[name="app-key"]')?.getAttribute("content")||"").trim();
    let businessId="";
    if(appKey){
     const response=await fetch("/api/app/current-business/"+encodeURIComponent(appKey),options);
     if(!response.ok&&response.status!==404)throw new Error("Unable to resolve this application's business role.");
     if(response.ok){const data=await response.json();businessId=getId(data.business||data.data||data);}
    }
    const response=await fetch("/api/users/me/profile"+(businessId?"?business="+encodeURIComponent(businessId):""),options);
    const data=await response.json().catch(()=>null);
    if(!response.ok||!data?.data?.user)throw new Error(data?.message||"Unable to load your core profile.");
    if(!active)return;
    setProfile(data.data.user);
    setDetails(data.data.details);
    setRoleAssignment(data.data.roleAssignment);
   }catch(err){if(active)setError(err.message||"Failed to load profile");}
   finally{if(active)setLoading(false);}
  };
  loadProfile();
  window.addEventListener("ECOSPHERE_AUTH_UPDATED",loadProfile);
  return()=>{active=false;window.removeEventListener("ECOSPHERE_AUTH_UPDATED",loadProfile);};
 },[]);

 const displayRole=getDisplayRole();

 if(loading)
 {
  return(
   <Container className="py-4">
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:"320px"}}>
     <Spinner animation="border"/>
    </div>
   </Container>
  );
 }

 if(error)
 {
  return(
   <Container className="py-4">
    <Alert variant="danger" className="mb-0">{error}</Alert>
   </Container>
  );
 }

 return(
  <main className="dashboard user-profile-page">
   <section className="user-profile-hero">
    <div>
     <p className="user-profile-eyebrow">Account Workspace</p>
     <h1>User Profile</h1>
     <p>Review your account identity, contact details, address, access, notes, and account history.</p>
    </div>
    <div className="user-profile-overview">
     <div><small>Current Access</small><span>{profile?.isActive?"Active account":"Inactive account"}</span></div>
     <p>Your profile information and application access are shown together in one workspace.</p>
    </div>
   </section>

   <section className="user-profile-stats" aria-label="Account summary">
    <article><small>Account</small><strong>{profile?.isActive?"Active":"Inactive"}</strong><span>{profile?.username||"—"}</span></article>
    <article><small>Username</small><strong>{profile?.username||"—"}</strong><span>Account identity</span></article>
    <article><small>Contact</small><strong>{(details?.phone||details?.cell)?"Available":"Missing"}</strong><span>{details?.phone||details?.cell||"—"}</span></article>
    <article><small>Last Login</small><strong>{profile?.lastLogin?new Date(profile.lastLogin).toLocaleDateString():"—"}</strong><span>Account activity</span></article>
   </section>

   <Row className="g-4">
    <Col lg={4}>
     <Card className="profile-identity-card h-100">
      <Card.Body className="text-center">
       {getAvatarUrl()?(
        <Image
         src={getAvatarUrl()}
         alt={`${details?.firstName||profile?.username||"User"} avatar`}
         roundedCircle
         fluid
         style={{width:"160px",height:"160px",objectFit:"cover",border:"3px solid var(--ztk-secondary)"}}
         className="mb-3"
        />
       ):(
        <div
         className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
         style={{width:"160px",height:"160px",background:"var(--ztk-surface-alt)",border:"3px solid var(--ztk-secondary)",fontSize:"3rem",fontWeight:"700",color:"var(--ztk-primary-dark)"}}
        >
         {(details?.firstName?.[0]||profile?.username?.[0]||"U").toUpperCase()}
        </div>
       )}

       <h3 className="mb-1">{[details?.firstName,details?.lastName].filter(Boolean).join(" ")||profile?.username||"User"}</h3>
       <p className="text-muted mb-2">{profile?.email||"—"}</p>
       <Badge bg={getRoleBadgeVariant(displayRole)} className="text-uppercase">{displayRole||"—"}</Badge>

       <ListGroup variant="flush" className="mt-4 text-start">
       
        <ListGroup.Item>
         <strong>Username:</strong> {profile?.username||"—"}
        </ListGroup.Item>
        <ListGroup.Item>
         <strong>Status:</strong> {profile?.isActive?"Active":"Inactive"}
        </ListGroup.Item>
        <ListGroup.Item>
         <strong>Last Login:</strong> {formatDate(profile?.lastLogin)}
        </ListGroup.Item>
        <ListGroup.Item>
         <strong>Created:</strong> {formatDate(profile?.createdAt)}
        </ListGroup.Item>
       </ListGroup>
      </Card.Body>
     </Card>
    </Col>

    <Col lg={8}>
     <Card className="profile-details-card mb-4">
      <Card.Header>User Details</Card.Header>
      <Card.Body>
       <Row className="g-3">
        <Col md={6}>
         <div><strong>First Name:</strong> {details?.firstName||"—"}</div>
        </Col>
        <Col md={6}>
         <div><strong>Last Name:</strong> {details?.lastName||"—"}</div>
        </Col>
        <Col md={6}>
         <div><strong>Phone:</strong> {formatPhone(details?.phone,details?.country)}</div>
        </Col>
        <Col md={6}>
         <div><strong>Cell:</strong> {formatPhone(details?.cell,details?.country)}</div>
        </Col>
        <Col md={6}>
         <div><strong>Address 1:</strong> {details?.address1||"—"}</div>
        </Col>
        <Col md={6}>
         <div><strong>Address 2:</strong> {details?.address2||"—"}</div>
        </Col>
        <Col md={4}>
         <div><strong>City:</strong> {details?.city||"—"}</div>
        </Col>
        <Col md={4}>
         <div><strong>State:</strong> {details?.state?.name&&details?.state?.abbreviation?`${details.state.name} (${details.state.abbreviation})`:details?.state?.name||details?.state?.abbreviation||"—"}</div>
        </Col>
        <Col md={4}>
         <div><strong>County:</strong> {details?.county?.name||"—"}</div>
        </Col>
        <Col md={6}>
         <div><strong>Postal Code:</strong> {details?.postalCode||"—"}</div>
        </Col>
        <Col md={6}>
         <div><strong>Country:</strong> {details?.country?.name||details?.country?.iso2||(typeof details?.country==="string"?details.country:"—")}</div>
        </Col>
       </Row>
      </Card.Body>
     </Card>

     <Card className="profile-details-card">
      <Card.Header>Notes</Card.Header>
      <Card.Body>
       {Array.isArray(details?.notes)&&details.notes.length?(
        <ListGroup variant="flush">
         {details.notes.map((note,index)=>(
          <ListGroup.Item key={index}>{note}</ListGroup.Item>
         ))}
        </ListGroup>
       ):(
        <p className="mb-0 text-muted">No notes available.</p>
       )}
      </Card.Body>
     </Card>
    </Col>
   </Row>
  </main>
 );
}