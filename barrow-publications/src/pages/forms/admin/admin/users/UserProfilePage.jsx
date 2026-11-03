import {useEffect,useState} from "react";
import {Container,Row,Col,Card,Spinner,Alert,Image,ListGroup,Badge} from "react-bootstrap";
import {loadCurrentBusiness} from "../../../../../utils/currentBusiness.js";

export default function UserProfilePage()
{
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [profile,setProfile]=useState(null);
 const [details,setDetails]=useState(null);
 const [roleAssignment,setRoleAssignment]=useState(null);
 const [departmentAssignment,setDepartmentAssignment]=useState(null);

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

 const isObjectIdString=value=>{
  return typeof value==="string"&&/^[a-f\d]{24}$/i.test(value);
 };

 const getUserId=user=>{
  const userId=getId(user)||getId(user?.user)||getId(user?.data)||getId(user?.profile)||getId(user?.authUser);
  return isObjectIdString(userId)?userId:"";
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

 const getLocationName=value=>{
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
   return value.name||value.abbreviation||value.iso2||value.iso3||"";
  }

  return "";
 };

 const formatHardinessZone=value=>{
  if(!value)
  {
   return "—";
  }

  if(typeof value==="string")
  {
   return value;
  }

  if(typeof value==="object")
  {
   const zone=value.zone||value.name||value.label||"";
   const region=value.region||"";
   return [zone,region].filter(Boolean).join(" - ")||"—";
  }

  return "—";
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
  const normalizedCountry=getLocationName(country).trim().toLowerCase();

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

  const departmentOverrideRole=getRoleName(departmentAssignment?.role);

  if(departmentOverrideRole)
  {
   return departmentOverrideRole;
  }

  const departmentDefaultRole=getRoleName(departmentAssignment?.department?.defaultRole);

  if(departmentDefaultRole)
  {
   return departmentDefaultRole;
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
  const loadProfile=async()=>{
   setLoading(true);
   setError("");

   try
   {
    const storedUser=getStoredUser();
    const userId=getUserId(storedUser);

    if(!userId)
    {
     throw new Error("No logged in user found");
    }

    setProfile({
     ...(storedUser||{}),
     _id:userId
    });

    const userRes=await fetch(`/api/users/${userId}`,{
     cache:"no-store",
     headers:{
      "Cache-Control":"no-cache",
      "Pragma":"no-cache"
     }
    });

    const userData=await userRes.json().catch(()=>null);

    if(userRes.ok)
    {
     const nextProfile=userData?.data||userData?.user||userData;

     if(nextProfile&&typeof nextProfile==="object")
     {
      setProfile(prev=>({
       ...(prev||{}),
       ...nextProfile,
       _id:getId(nextProfile)||userId
      }));

      setDetails(nextProfile.details&&typeof nextProfile.details==="object"?nextProfile.details:null);
     }
    }

    const businessId=getId(await loadCurrentBusiness());

    if(businessId)
    {
     const [assignmentRes,departmentAssignmentRes]=await Promise.all([
      fetch(`/api/users/role-assignments?user=${userId}&business=${businessId}&isActive=true`,{
      cache:"no-store",
      headers:{
       "Cache-Control":"no-cache",
       "Pragma":"no-cache"
      }
      }),
      fetch(`/api/users/department-assignments?user=${userId}&business=${businessId}&isActive=true`,{
       cache:"no-store",
       headers:{
        "Cache-Control":"no-cache",
        "Pragma":"no-cache"
       }
      })
     ]);

     const assignmentData=await assignmentRes.json().catch(()=>null);
     const departmentAssignmentData=await departmentAssignmentRes.json().catch(()=>null);

     if(assignmentRes.ok)
     {
      const assignments=Array.isArray(assignmentData?.data)?assignmentData.data:Array.isArray(assignmentData)?assignmentData:[];
      setRoleAssignment(assignments.length?assignments[0]:null);
     }
     else
     {
      setRoleAssignment(null);
     }

     if(departmentAssignmentRes.ok)
     {
      const assignments=Array.isArray(departmentAssignmentData?.data)?departmentAssignmentData.data:Array.isArray(departmentAssignmentData)?departmentAssignmentData:[];
      setDepartmentAssignment(assignments.length?assignments[0]:null);
     }
     else
     {
      setDepartmentAssignment(null);
     }
    }
    else
    {
     setRoleAssignment(null);
     setDepartmentAssignment(null);
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

 const displayRole=getDisplayRole();

 if(loading)
 {
  return(
   <Container className="py-4">
    <div className="profile-loading-shell d-flex justify-content-center align-items-center">
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
  <Container className="py-4">
   <Row className="g-4">
    <Col lg={4}>
     <Card className="shadow-sm h-100">
      <Card.Body className="text-center">
       {getAvatarUrl()?(
        <Image
         src={getAvatarUrl()}
         alt={`${details?.firstName||profile?.username||"User"} avatar`}
         roundedCircle
         fluid
         className="mb-3 profile-avatar"
        />
       ):(
        <div
         className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle profile-avatar-placeholder"
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
         <strong>USDA Zone:</strong> {formatHardinessZone(profile?.hardinessZone)}
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
     <Card className="shadow-sm mb-4">
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
         <div><strong>Country:</strong> {getLocationName(details?.country)||"—"}</div>
        </Col>
       </Row>
      </Card.Body>
     </Card>

     <Card className="shadow-sm">
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
  </Container>
 );
}
