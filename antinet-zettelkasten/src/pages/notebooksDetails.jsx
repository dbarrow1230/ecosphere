import {useEffect,useState} from "react";
import {Link,useParams} from "react-router-dom";
import {Container,Row,Col,Card,Badge,Spinner,Alert,Table,ListGroup} from "react-bootstrap";
import "../styles/notebooks.css";

export default function NotebooksDetails()
{
 const {id}=useParams();
 const [notebook,setNotebook]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 const getToken=()=>{
  try
  {
   return (localStorage.getItem("token")||"").trim();
  }
  catch(err)
  {
   console.error("Failed to read token",err);
   return "";
  }
 };

 const getAuthHeaders=()=>{
  const token=getToken();
  return token?{
   "Content-Type":"application/json",
   Authorization:`Bearer ${token}`
  }:{
   "Content-Type":"application/json"
  };
 };

 useEffect(()=>{
  const fetchNotebook=async()=>{
   try
   {
    setLoading(true);
    setError("");

    const res=await fetch(`/api/notebooks/${id}`,{
     method:"GET",
     headers:getAuthHeaders()
    });

    const data=await res.json();

    if(!res.ok)
    {
     throw new Error(data.error||data.message||"Failed to load notebook details");
    }

    const loadedNotebook=data.data||data;
    const notesRes=await fetch(`/api/notes?notebook=${encodeURIComponent(id)}`,{
     method:"GET",
     headers:getAuthHeaders()
    });
    const notesData=await notesRes.json();

    if(!notesRes.ok)
    {
     throw new Error(notesData.error||notesData.message||"Failed to load notebook notes");
    }

    setNotebook({
     ...loadedNotebook,
     notes:Array.isArray(notesData.data)?notesData.data:[]
    });
   }
   catch(err)
   {
    console.error("Error loading notebook details",err);
    setNotebook(null);
    setError(err.message||"Failed to load notebook details");
   }
   finally
   {
    setLoading(false);
   }
  };

  if(id)
  {
   fetchNotebook();
  }
 },[id]);

 const relatedNotes=Array.isArray(notebook?.notes)?notebook.notes:[];
 const renderTagBadge=(tag,index)=>{
  if(!tag)return null;

  const tagName=typeof tag==="string"?tag:tag.name||"Untitled Tag";
  const tagColor=typeof tag==="object"&&tag?.color?tag.color:"#6c757d";

  return(
   <Badge
    key={tag._id||tagName||index}
    bg="transparent"
    className="border"
    style={{color:tagColor,borderColor:tagColor}}
   >
    {tagName}
   </Badge>
  );
 };

 if(loading)
 {
  return(
   <Container className="py-4 text-center">
    <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>
   </Container>
  );
 }

 return(
  <Container className="py-4">
   <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
     <h1 className="mb-1">{notebook?.name||"Notebook Details"}</h1>
     <Link to="/notebooks" className="text-decoration-none">← Back to Notebooks</Link>
    </div>
   </div>

   {error&&<Alert variant="danger">{error}</Alert>}

   {!error&&notebook&&
    <Row className="g-4">
     <Col lg={4}>
      <Card>
       <Card.Body>
        <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
         <Badge bg="transparent" className="notebook-badge" style={{"--notebook-color":notebook.color}}>{notebook.name}</Badge>
         {notebook.isArchived&&<span className="text-muted small">(archived)</span>}
        </div>

        <p className="text-muted mb-3">{notebook.description||"No description available."}</p>

        <Table bordered size="sm" className="mb-0">
         <tbody>
          <tr>
           <th style={{width:"140px"}}>Status</th>
           <td>{notebook.isArchived?"Archived":"Active"}</td>
          </tr>
          <tr>
           <th>Created</th>
           <td>{notebook.createdAt?new Date(notebook.createdAt).toLocaleString():"-"}</td>
          </tr>
          <tr>
           <th>Updated</th>
           <td>{notebook.updatedAt?new Date(notebook.updatedAt).toLocaleString():"-"}</td>
          </tr>
          <tr>
           <th>Notes</th>
           <td>{relatedNotes.length}</td>
          </tr>
          <tr>
           <th>ID</th>
           <td className="text-break">{notebook._id||"-"}</td>
          </tr>
         </tbody>
        </Table>
       </Card.Body>
      </Card>
     </Col>

     <Col lg={8}>
      <Card>
       <Card.Header>Related Notes</Card.Header>
       <Card.Body className="p-0">
        {relatedNotes.length===0?
         <div className="p-3 text-muted">No related notes found.</div>
        :
         <div style={{maxHeight:"70vh",overflowY:"auto"}}>
          <ListGroup variant="flush">
           {relatedNotes.map(note=>(
            <ListGroup.Item key={note._id}>
             <div className="d-flex justify-content-between align-items-start gap-3">
              <div className="flex-grow-1">
               <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                <Link to={`/notes/${note._id}`} className="fw-semibold text-decoration-none">
                 {note.title||"Untitled Note"}
                </Link>

                <Badge bg={note.status==="active"?"success":note.status==="draft"?"warning":"secondary"}>
                 {note.status||"unknown"}
                </Badge>

                {note.noteType?.name&&
                 <Badge bg="info">
                  {note.noteType.name}
                 </Badge>
                }

                {note.isFavorite&&
                 <Badge bg="light" text="dark">
                  Favorite
                 </Badge>
                }

                {note.isArchived&&
                 <Badge bg="dark">
                  Archived
                 </Badge>
                }
               </div>

               {note.summary?
                <p className="mb-2 text-muted">{note.summary}</p>
               :
                <p className="mb-2 text-muted">No summary available.</p>
               }

               {Array.isArray(note.tags)&&note.tags.length>0&&
                <div className="d-flex flex-wrap gap-2 mt-2">
                 {note.tags.map((tag,index)=>renderTagBadge(tag,index))}
                </div>
               }
              </div>

              <div className="text-end small text-muted" style={{minWidth:"160px"}}>
               <div>Updated</div>
               <div>{note.updatedAt?new Date(note.updatedAt).toLocaleDateString():"-"}</div>
              </div>
             </div>
            </ListGroup.Item>
           ))}
          </ListGroup>
         </div>
        }
       </Card.Body>
      </Card>
     </Col>
    </Row>
   }
  </Container>
 );
}
