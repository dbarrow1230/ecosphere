import {useCallback,useEffect,useRef,useState} from "react";
import {
 Alert,
 Badge,
 Button,
 Container,
 ListGroup,
 Modal,
 Spinner
} from "react-bootstrap";
import TagForm from "./forms/TagForm.jsx";
import "../styles/tags.css";

// Helper: normalize IDs from stored user records
const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value.$oid==="string")return value.$oid;
 if(typeof value._id==="string")return value._id;
 if(typeof value.id==="string")return value.id;
 if(typeof value._id?.$oid==="string")return value._id.$oid;
 if(typeof value.id?.$oid==="string")return value.id.$oid;
 return "";
};

// Helper: locate the stored authenticated user
const getStoredUser=()=>{
 for(const key of ["user","userInfo","authUser","currentUser"]){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);

   if(!raw)continue;

   const parsed=JSON.parse(raw);
   const user=parsed?.user||parsed?.data||parsed;

   if(getObjectId(user))return user;
  }catch(error){
   console.error(`Failed to parse stored user: ${key}`,error);
  }
 }

 return null;
};

// Helper: sort tags alphabetically
const sortTags=tags=>{
 return [...tags].sort((first,second)=>
  String(first.name||"").localeCompare(
   String(second.name||""),
   undefined,
   {sensitivity:"base"}
  )
 );
};

export default function Tags(){
 const [user]=useState(()=>getStoredUser());
 const [tags,setTags]=useState([]);
 const [loading,setLoading]=useState(true);
 const [showForm,setShowForm]=useState(false);
 const [currentTag,setCurrentTag]=useState(null);
 const [showDelete,setShowDelete]=useState(false);
 const [tagToDelete,setTagToDelete]=useState(null);
 const [alert,setAlert]=useState(null);
 const alertTimer=useRef(null);

 const userId=getObjectId(user);
 const canManageTags=Boolean(userId);

 // Helper: display a temporary page message
 const showTimedAlert=(variant,message)=>{
  setAlert({variant,message});

  if(alertTimer.current){
   clearTimeout(alertTimer.current);
  }

  alertTimer.current=setTimeout(()=>{
   setAlert(null);
   alertTimer.current=null;
  },5000);
 };

 const fetchTags=useCallback(async()=>{
  if(!userId){
   setTags([]);
   setLoading(false);
   return;
  }

  try{
   setLoading(true);

   const response=await fetch(
    `/api/tags?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to load tags");
   }

   setTags(sortTags(
    Array.isArray(data?.data)
     ?data.data
     :[]
   ));
  }catch(error){
   console.error("Error loading tags",error);
   setTags([]);
   showTimedAlert("danger",error.message);
  }finally{
   setLoading(false);
  }
 },[userId]);

 useEffect(()=>{
  fetchTags();

  return()=>{
   if(alertTimer.current){
    clearTimeout(alertTimer.current);
   }
  };
 },[fetchTags]);

 const closeForm=()=>{
  setShowForm(false);
  setCurrentTag(null);
 };

 const handleAdd=()=>{
  if(!canManageTags)return;

  setCurrentTag(null);
  setShowForm(true);
 };

 const handleEdit=tag=>{
  if(!canManageTags)return;

  setCurrentTag(tag);
  setShowForm(true);
 };

 const handleArchive=async tag=>{
  if(!canManageTags||tag.status==="archived")return;

  try{
   const response=await fetch(
    `/api/tags/${tag._id}/archive`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId})
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to archive tag");
   }

   setTags(current=>sortTags(
    current.map(item=>
     item._id===tag._id
      ?data.data
      :item
    )
   ));

   showTimedAlert("success","Tag archived");
  }catch(error){
   console.error("Error archiving tag",error);
   showTimedAlert("danger",error.message);
  }
 };

 const handleDeleteConfirm=tag=>{
  if(!canManageTags)return;

  setTagToDelete(tag);
  setShowDelete(true);
 };

 const closeDelete=()=>{
  setShowDelete(false);
  setTagToDelete(null);
 };

 const handleDelete=async()=>{
  if(!tagToDelete||!canManageTags)return;

  try{
   const response=await fetch(
    `/api/tags/${tagToDelete._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to delete tag");
   }

   setTags(current=>
    current.filter(tag=>tag._id!==tagToDelete._id)
   );

   closeDelete();
   showTimedAlert("success","Tag deleted");
  }catch(error){
   console.error("Error deleting tag",error);
   showTimedAlert("danger",error.message);
  }
 };

 const handleFormSuccess=savedTag=>{
  closeForm();

  setTags(current=>{
   const exists=current.some(tag=>tag._id===savedTag._id);

   return sortTags(
    exists
     ?current.map(tag=>
      tag._id===savedTag._id
       ?savedTag
       :tag
     )
     :[...current,savedTag]
   );
  });

  showTimedAlert(
   "success",
   currentTag?._id
    ?"Tag updated"
    :"Tag created"
  );
 };

 if(loading){
  return(
   <Container className="py-4 text-center">
    <Spinner animation="border" role="status">
     <span className="visually-hidden">Loading...</span>
    </Spinner>
   </Container>
  );
 }

 if(!canManageTags){
  return(
   <Container className="py-4">
    <Alert variant="info">
     Log in to view and manage your tags.
    </Alert>
   </Container>
  );
 }

 return(
  <Container className="py-4">
   <div className="d-flex justify-content-between align-items-center mb-4">
    <h1 className="mb-0">Tags</h1>

    <Button onClick={handleAdd}>
     Add Tag
    </Button>
   </div>

   {alert&&(
    <Alert
     variant={alert.variant}
     dismissible
     onClose={()=>setAlert(null)}
    >
     {alert.message}
    </Alert>
   )}

   {!tags.length?(
    <Alert variant="secondary">
     No tags found.
    </Alert>
   ):(
    <div className="tag-list-scroll">
     <ListGroup>
      {tags.map(tag=>(
       <ListGroup.Item key={tag._id}>
        <div className="d-flex justify-content-between align-items-start gap-3">
         <div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
           <Badge
            bg="transparent"
            className="tag-badge"
            style={tag.color?{"--tag-color":tag.color}:undefined}
           >
            {tag.name}
           </Badge>

           {tag.slug&&(
            <span className="text-muted small">
             {tag.slug}
            </span>
           )}

           <Badge
            bg={tag.status==="archived"?"secondary":"success"}
           >
            {tag.status||"active"}
           </Badge>
          </div>

          {tag.description&&(
           <p className="mb-0 mt-2 text-muted">
            {tag.description}
           </p>
          )}
         </div>

         <div className="d-flex gap-2 flex-wrap justify-content-end">
          <Button
           size="sm"
           variant="outline-warning"
           onClick={()=>handleEdit(tag)}
          >
           Edit
          </Button>

          <Button
           size="sm"
           variant="outline-secondary"
           disabled={tag.status==="archived"}
           onClick={()=>handleArchive(tag)}
          >
           Archive
          </Button>

          <Button
           size="sm"
           variant="outline-danger"
           onClick={()=>handleDeleteConfirm(tag)}
          >
           Delete
          </Button>
         </div>
        </div>
       </ListGroup.Item>
      ))}
     </ListGroup>
    </div>
   )}

   <Modal
    show={showForm}
    onHide={closeForm}
    centered
   >
    <Modal.Header closeButton>
     <Modal.Title>
      {currentTag?"Edit Tag":"Add Tag"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <TagForm
      tag={currentTag}
      userId={userId}
      onSuccess={handleFormSuccess}
      onCancel={closeForm}
     />
    </Modal.Body>
   </Modal>

   <Modal
    show={showDelete}
    onHide={closeDelete}
    centered
   >
    <Modal.Header closeButton>
     <Modal.Title>Delete Tag</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     Are you sure you want to delete{" "}
     <strong>{tagToDelete?.name||"this tag"}</strong>?
    </Modal.Body>

    <Modal.Footer>
     <Button
      variant="secondary"
      onClick={closeDelete}
     >
      Cancel
     </Button>

     <Button
      variant="danger"
      onClick={handleDelete}
     >
      Delete
     </Button>
    </Modal.Footer>
   </Modal>
  </Container>
 );
}