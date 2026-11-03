import {useEffect,useState} from "react";
import {Container,Row,Col,Card,Spinner,Alert,Image,ListGroup,Badge} from "react-bootstrap";
import "../../../styles/UserProfilePage.css";


export default function UserProfilePage()
{
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [profile,setProfile]=useState(null);
 const [details,setDetails]=useState(null);

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

    if(parsed?._id)
    {
     return parsed;
    }

    if(parsed?.user?._id)
    {
     return parsed.user;
    }

    if(parsed?.data?._id)
    {
     return parsed.data;
    }
   }
   catch(err)
   {
    console.error(`Failed to parse localStorage key: ${key}`,err);
   }
  }

  return null;
 };

 const formatDate=(value)=>{
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
  const normalizedCountry=(country||"").trim().toLowerCase();

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

 const getRoleName=(role)=>{
  if(!role)
  {
   return "";
  }

  if(typeof role==="object")
  {
   return role.name||"";
  }

  if(typeof role==="string")
  {
   return role;
  }

  return "";
 };

 const getRoleBadgeVariant=(role)=>{
  const roleName=getRoleName(role);

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
  const loadProfile=async()=>{
   setLoading(true);
   setError("");

   try
   {
    const storedUser=getStoredUser();

    if(!storedUser?._id)
    {
     throw new Error("No logged in user found");
    }

    setProfile(storedUser);

    const userRes=await fetch(`/api/users/${storedUser._id}`);
    const userData=await userRes.json();

    if(userRes.ok)
    {
      const nextProfile=userData?.data||userData?.user||userData;

      if(nextProfile&&typeof nextProfile==="object")
      {
       setProfile(prev=>({
        ...(prev||{}),
        ...nextProfile
       }));
      }
    }

    const detailsRes=await fetch(`/api/users/details/user/${storedUser._id}`);
    const detailsData=await detailsRes.json();

    if(detailsRes.ok)
    {
     if(Array.isArray(detailsData.data))
     {
      setDetails(detailsData.data.length?detailsData.data[0]:null);
     }
     else
     {
      setDetails(detailsData.data||detailsData.userDetails||detailsData||null);
     }
    }
    else
    {
     setDetails(null);
    }
   }
   catch(err)
   {
    console.error("Profile load error",err);
    setError(err.message||"Failed to load profile");
   }
   finally
   {
    setLoading(false);
   }
  };

  loadProfile();
 },[]);

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
    <article><small>Contact</small><strong>{details?.phone?"Available":"Missing"}</strong><span>{details?.phone||"—"}</span></article>
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
       <Badge bg={getRoleBadgeVariant(profile?.role)} className="text-uppercase">{getRoleName(profile?.role)||"—"}</Badge>

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
         <div><strong>Country:</strong> {details?.country||"—"}</div>
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